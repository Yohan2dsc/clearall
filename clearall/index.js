const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });

const chalk = require('chalk');
const readline = require('readline-sync');
const log = console.log;
const colors = require ('gradient-string')

console.clear();
log(colors.mind(`                                                                    
██████ ██      ███████  █████  ██████       █████   ██████  ██████ 
██      ██      ██      ██   ██ ██   ██     ██   ██ ██      ██      
██      ██      █████   ███████ ██████      ███████ ██      ██      
██      ██      ██      ██   ██ ██   ██     ██   ██ ██      ██      
 ██████ ███████ ███████ ██   ██ ██   ██     ██   ██  ██████  ██████ 
                                   
`))


client.on('ready', async () => {
    console.log(`Logged in as ${chalk.hex('#8a2be2').bold(client.user.tag)}`);

    const friends = client.relationships.cache.filter(relationshipType => relationshipType === 1);

    console.log(`\nVous avez ${chalk.bold(friends.size)} amis`);
    console.log('Démarrage du processus de nettoyage de la liste d’amis. Nous ne supprimerons aucun ami sans votre contribution directe!\n');

    const options = [
        chalk.magenta('[1] Delete Friends'),
        chalk.blue('[2] Leave Servers'),
        chalk.cyan('[3] Close DMs'),
        chalk.redBright('[4] Clear All')
    ];

    const choice = readline.keyInSelect(options, 'Que voulez-vous faire?');

    switch (choice) {
        case 0:
            deleteFriends(friends).then(() => process.exit());
            break;
        case 1:
            leaveServers().then(() => process.exit());
            break;
        case 2:
            closeDMs().then(() => process.exit());
            break;                                                                                                                                                         
        case 3:    
        case 4:
            clearAll().then(() => process.exit());
            break;
        default:
            console.log('Choix invalide. Le script va se fermer.');
            process.exit();
    }
});

async function deleteFriends(friends) {
    for (const friend of friends) {
        const friendId = friend[0];
        const user = await client.users.fetch(friendId, { force: true });

        await user.unFriend().catch(err => console.error(err));
        console.log(`Ami retiré : ${user.tag}`);
    }

    console.log(chalk.green('Tous les amis ont été retirés !'));
}

async function leaveServers() {
    const guilds = client.guilds.cache;

    for (const guild of guilds.values()) {
        await guild.leave().catch(err => console.error(err));
        console.log(`${chalk.red(guild.id)} quitté`);
    }

    console.log(chalk.red('Je leave tout les serveurs.'));
}

async function closeDMs() {
    const userDMs = client.users.cache.map(user => user.dmChannel).filter(dmChannel => dmChannel);
    const groupDMs = client.channels.cache.filter(channel => channel.type === 'group');

    for (const dmChannel of userDMs) {
        await dmChannel.delete().catch(err => console.error(err));
        console.log(`DM fermé avec ${dmChannel.recipient.tag}`);
    }

    for (const groupDM of groupDMs) {
        await groupDM.leave().catch(err => console.error(err));
        console.log(`Groupe quitté : ${groupDM.name}`);
    }

    console.log(chalk.cyan("Tous les DMs et groupes ont été fermés/quittés."));
}

async function clearAll() {
    console.log('Étape 1 : Fermeture des DMs en cours...');
    await closeDMs();

    console.log('Étape 2 : Suppression de tous les amis en cours...');
    const allFriends = client.relationships.cache.filter(relationshipType => relationshipType === 1);
    await deleteFriends(allFriends);

    console.log('Étape 3 : Quitter tous les serveurs en cours...');
    await leaveServers();

    console.log(chalk.red('Toutes les étapes ont été complétées.'));
}

async function login() {
    const token = readline.question('Token: ', { hideEchoBack: true });

    console.log('Connexion en cours...');

    try {
        await client.login(token);
    } catch (err) {
        console.error(chalk.red(err));
        login();
    }
}

login();