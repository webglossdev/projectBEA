const axios = require('axios');
const FormData = require('form-data');
const { Events } = require('discord.js');
const { createErrorEmbed } = require('../utils/embed');
const config = require('../config');
const whitelist = require('../whitelist');
const { mayReach, normalizeMode, checkCommandAccess } = require('../access');

// single messageCreate handler: routes `!commands` and forwards plain chat to
// the brain as a perception (Bea answers autonomously via her discord tools).
function register(client) {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        if (message.content.startsWith('!')) {
            return handleCommand(client, message);
        }
        return handleChat(client, message);
    });
}

async function handleCommand(client, message) {
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    const userId = message.author.id;
    const isOwner = config.ADMIN_ID !== '' && userId === config.ADMIN_ID;

    // the owner is the admin and runs everything; everyone else needs the
    // whitelist for ordinary commands. A denial always answers: a silent
    // return left people locked out with no way to tell why.
    const access = checkCommandAccess({
        category: command.category,
        isOwner,
        whitelisted: whitelist.has(userId),
    });
    if (!access.allowed) {
        if (access.reason === 'owner-only') {
            await message.reply({ embeds: [createErrorEmbed('That command answers to the owner and nobody else.')] });
        } else {
            await message.reply({ embeds: [createErrorEmbed(
                `You are not on the whitelist (your id: \`${userId}\`). ` +
                `Ask the owner to run \`!wl add ${userId}\`.`
            )] });
        }
        return;
    }

    try {
        await command.execute(message, args, {
            client,
            whitelist: whitelist.list,
            saveWhitelist: whitelist.save,
            isOwner,
            voiceManager: client.voiceManager,
        });
    } catch (error) {
        console.error(error);
        await message.reply({ embeds: [createErrorEmbed('There was an error executing that command!')] });
    }
}

async function handleChat(client, message) {
    const userId = message.author.id;
    const whitelisted = whitelist.has(userId);
    // strict keeps the old wall; boost/open let strangers reach her and let the
    // roster decide over time who becomes someone she knows
    if (!mayReach(normalizeMode(config.ACCESS_MODE), whitelisted)) return;

    const isMentioned = message.mentions.has(client.user.id);
    const isDM = !message.guild;

    let isReplyToBot = false;
    if (message.reference && message.reference.messageId) {
        try {
            const replied = await message.channel.messages.fetch(message.reference.messageId);
            isReplyToBot = replied.author.id === client.user.id;
        } catch (e) {
            console.error('Failed to fetch replied message', e);
        }
    }

    const cleanContent = message.content
        .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
        .trim();
    const audio = [...message.attachments.values()].find((attachment) => {
        const contentType = (attachment.contentType || '').toLowerCase();
        return contentType.startsWith('audio/') || /\.(oga|ogg|opus|mp3|wav|m4a|webm)$/i.test(attachment.name || '');
    });
    const attachments = [...message.attachments.values()];
    const attachmentUrls = attachments
        .filter((attachment) => {
            const contentType = (attachment.contentType || '').toLowerCase();
            return contentType.startsWith('image/') ||
                /\.(png|jpe?g|gif|webp|bmp)$/i.test(attachment.name || '');
        })
        .map((attachment) => attachment.url);
    const attachmentText = attachments
        .filter((attachment) => attachment !== audio)
        .map((attachment) => `[attachment: ${attachment.name || 'file'}]`)
        .join(' ');
    // An audio attachment is an intentional message, like a DM or a reply.
    // Text in a busy channel still requires an explicit mention/reply.
    if (!(isMentioned || isReplyToBot || isDM || attachments.length)) return;
    if (!cleanContent && !audio && !attachmentText) return;

    const displayName = message.member
        ? message.member.displayName
        : (message.author.globalName || message.author.username);

    try {
        if (audio) {
            const response = await axios.get(audio.url, { responseType: 'arraybuffer' });
            const form = new FormData();
            form.append('file', response.data, {
                filename: audio.name || 'discord_voice_message',
                contentType: audio.contentType || 'application/octet-stream',
            });
            form.append('username', displayName);
            form.append('user_id', userId);
            form.append('channel_id', message.channel.id);
            form.append('message_id', message.id);
            form.append('is_dm', String(isDM));
            form.append('whitelisted', String(whitelisted));
            if (cleanContent) form.append('caption', cleanContent);
            await axios.post(`${config.BRAIN_API_URL}/discord/voice-message`, form, {
                headers: form.getHeaders(),
                maxContentLength: 25 * 1024 * 1024,
                maxBodyLength: 25 * 1024 * 1024,
            });
        } else {
            // deposit a perception and return: Bea decides whether/how to answer
            // and calls discord_reply / discord_send_message herself.
            await axios.post(`${config.BRAIN_API_URL}/discord/chat`, {
                username: displayName,
                message: [attachmentText, cleanContent].filter(Boolean).join(' ').trim(),
                channelId: message.channel.id,
                userId: userId,
                messageId: message.id,
                isDm: isDM,
                whitelisted,
                attachment_urls: attachmentUrls,
            });
        }
    } catch (error) {
        console.error('Error talking to Brain:', error.message);
    }
}

module.exports = { register, handleCommand };
