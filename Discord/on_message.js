const Link = require('../schemas/linkSchema.js');
const Baller = require('../schemas/ballerSchema.js');

const blChannelId = process.env.BL_CHANNEL_ID;
const publicCrossId = process.env.PUBLIC_CROSS_ID;
const privateCrossId = process.env.PRIVATE_CROSS_ID;
const heeHeeAudio = 'heehee.ogg';

module.exports = async (client, message) => {
    message.content = message.content.toLowerCase();
    if (!message.author.bot) {
        if(message.content == 'ts sit man' && message.member.roles.cache.has('1466745436764373216')){
            console.log(message.channelId);
            forwardMessage(client, message,message.channelId,"sit man");
            setTimeout(() => message.delete(), 1000)
        }

        if(message.content == 'bhakas alert' && (message.member.roles.cache.has('1466745436764373216') || message.member.roles.cache.has('1499578831349092432'))){
            console.log(message.channelId);
            forwardMessage(client, message,message.channelId,"https://tenor.com/view/duck-twerk-gif-11813731934647759555");
            // setTimeout(() => message.delete(), 1000)
        }

        if(message.content == 'hee hee' && (message.member.roles.cache.has('1466745436764373216') || message.member.roles.cache.has('1499578831349092432'))){
            console.log(message.channelId);
            forwardMessage(client, message,message.channelId,"*hee hee* 🕺🎵");
            
            if (Math.random() < 0.05) {
                forwardAudio(client, message.channelId, heeHeeAudio);
            }
            
            // setTimeout(() => message.delete(), 1000)
        }

        if((message.content == 'hee hee' || message.content == 'baller' || message.content == 'ts sit man' || message.content == 'bhakas alert') && !message.member.roles.cache.has('1466745436764373216') && !message.member.roles.cache.has('1499578831349092432')){
            const links = ['https://klipy.com/gifs/who-is-bro-1', 'https://klipy.com/gifs/komik-15', 'https://klipy.com/gifs/random-kid-1', 'https://klipy.com/gifs/meme-9587', 'https://klipy.com/gifs/cochu444yt-mike-brady', 'https://klipy.com/gifs/stranger-things-5-bro-think-he-part-of-the-team'];
            const randomLink = links[Math.floor(Math.random() * links.length)];
            forwardMessage(client, message,message.channelId,`<@${message.author.id}>\n${randomLink}`);
        }

        if(message.content.includes('baller') && (message.member.roles.cache.has('1466745436764373216') || message.member.roles.cache.has('1499578831349092432'))){
            if(message.content.includes('add')){
                const cause = (message.content.split('"')[1] || '').trim();
                const effect = message.content.split('"')[3].trim();
                console.log(`Cause: ${cause}, Effect: ${effect}`);

                await Baller.findOne({ cause: cause }).then(async (baller) => {
                    if (baller) {
                        console.log('Baller already exists');
                    } else {
                        const newBaller = new Baller({
                            cause: cause,
                            effect: effect
                        });
                        await newBaller.save();
                        console.log('New baller added');
                    }
                });

                setTimeout(() => message.delete(), 1000)
                forwardMessageDelete(client, message, message.channelId, `${cause}\n${effect}`);
            }

            else if(message.content.includes('remove')){
                const causeToRemove = message.content.split('"')[1].trim();
                await Baller.findOneAndDelete({ cause: causeToRemove }).then(() => {
                    forwardMessage(client, message, message.channelId, `"${causeToRemove}" has been slayed by ${message.author.username}.`);
                });
            }

            else if(message.content.includes('say')){
                const causeToSay = message.content.split('say')[1].trim();
                forwardMessage(client, message, message.channelId, causeToSay);
                setTimeout(() => message.delete(), 1000)
            }

            else{
                const ballerContent = message.content.split('baller')[1].trim();
                console.log(`Baller content:${ballerContent}`);
                await Baller.findOne({ cause: ballerContent }).then((baller) => {
                    if (baller) {
                        forwardMessage(client, message, message.channelId, `${baller.effect}`);
                    }
                });
                setTimeout(() => message.delete(), 1000)
            }
        }
        

        if (message.channel.id == publicCrossId && message) {
            if (message.content.includes('(') && message.content.includes(')')) {
                console.log('Cross question detected');
                forwardMessage(client, message, privateCrossId, 'New cross question from ' + message.author.username + ': ' + message.content);
            }
        }
        else if(message.channel.id == blChannelId && message) {
            if (message.content.includes('ts')) {
                console.log('backlink detected');
                bl = message.content.split(' ')
                // console.log(bl)
                if(bl[1] == 'remove'){
                    // console.log('asdasdasdas')
                    const links = bl[2].split(',')
                    links.forEach(async (link) => {
                        await Link.findOneAndDelete({backlink: link}).then(() => {
                            forwardMessage(client, message, blChannelId, `Backlink with short name ${link} has been removed.`);
                        })
                    })
                }

                if(bl[1] == 'show'){
                    // console.log('asdasdasdas')
                    await Link.find().then((links) => {
                        if(links.length > 0){
                            let content = 'Here are the backlinks:\n';
                            links.forEach(link => {
                                content += `**Name**: ${link.name}, **Short**: ${link.backlink}, **Link**: <${link.link}>\n`;
                            });
                            // sendMessage(message, content);
                            if (content.length > 2000) {
                                const chunks = [];
                                for (let i = 0; i < content.length; i += 2000) {
                                    chunks.push(content.slice(i, i + 2000));
                                }
                                for (const chunk of chunks) {
                                    forwardMessage(client, message, blChannelId, chunk);
                                }
                            } else {
                                forwardMessage(client, message, blChannelId, content);
                            }                        
                        }
                    }).catch(err => {
                        console.error('Error fetching backlinks:', err);
                        sendMessage(message, 'An error occurred while fetching backlinks.');
                    });
                }

                if(bl[1] == 'add'){
                    let blName, blShort, blLink;
                    blName = bl[2]
                    blShort = bl[3]
                    blLink = bl[4]

                    const date = new Date();
                    let errors = []
                
                    await Link.findOne({backlink:blShort}).then((link) => {
                        if(link){
                            errors.push({msg: "Backlink already exists"})
                        }
                    })
                
                    const newLink = new Link({
                        name: blName,
                        backlink: blShort,
                        link: blLink,
                        date
                    });
                    
                    await newLink.save()

                    forwardMessage(client, message, blChannelId , `New backlink from ${message.author.username}:\nName: ${blName}\nShort: ${blShort}\nLink: ${blLink}` );
                }

                if(bl[1] == 'edit'){
                    if(bl.length < 5 || bl.length > 5){
                        forwardMessage(client, message, blChannelId, 'Usage: `ts edit <short> <field> <new_value>`\nFields: name, link');
                        return;
                    }
                    
                    const shortToEdit = bl[2];
                    const fieldToEdit = bl[3];
                    const newValue = bl[4];
                    
                    if(!['name', 'link'].includes(fieldToEdit)){
                        forwardMessage(client, message, blChannelId, 'Invalid field. Available fields: backlink, link');
                        return;
                    }
                    
                    try {
                        const existingLink = await Link.findOne({backlink: shortToEdit});
                        
                        if(!existingLink){
                            forwardMessage(client, message, blChannelId, `Backlink with short name ${shortToEdit} not found.`);
                            return;
                        }
                        
                        const updateObj = {};
                        updateObj[fieldToEdit] = newValue;
                        
                        await Link.findOneAndUpdate({backlink: shortToEdit}, updateObj);
                        
                        forwardMessage(client, message, blChannelId, `Backlink ${shortToEdit} updated successfully!\n${fieldToEdit} changed to: ${newValue}`);
                        
                    } catch (error) {
                        console.error('Error editing backlink:', error);
                        forwardMessage(client, message, blChannelId, 'An error occurred while editing the backlink.');
                    }
                }

                
                if(bl[1] == 'help'){
                    const helpMessage = `**Backlink Commands** 
\`ts add <name> <short> <link>\` - Add a new backlink 
\`ts remove <short>\` - Remove a backlink by its short name 
\`ts show\` - Show all backlinks 
\`ts help\` - Show this help message
\`ts edit <backlink_to_edit> <field_to_edit> <new_value_for_field>\` - Edit a backlink field (name, link)`;
                    forwardMessage(client, message, blChannelId, helpMessage);
                }
            }
        }
    };
}

async function forwardMessageDelete(client, message, targetChannelId, content) {
    // console.log(content)
    try {
        const targetChannel = await client.channels.fetch(targetChannelId);
        if (targetChannel) {
            // console.log(content)
            const sentMessage = await targetChannel.send(content);
            setTimeout(() => sentMessage.delete().catch(() => {}), 1000);
            console.log(`Message forwarded to channel ${targetChannelId}`);
            return true;
        }
        return false;
    } catch (error) {
        // console.error('Failed to forward message:', error);
        return false;
    }
}

async function forwardMessage(client, message, targetChannelId, content) {
    // console.log(content)
    try {
        const targetChannel = await client.channels.fetch(targetChannelId);
        if (targetChannel) {
            // console.log(content)
            await targetChannel.send(content);
            console.log(`Message forwarded to channel ${targetChannelId}`);
            return true;
        }
        return false;
    } catch (error) {
        // console.error('Failed to forward message:', error);
        return false;
    }

    
}

async function forwardAudio(client, channelId, audioFile) {
    try {
        const targetChannel = await client.channels.fetch(channelId);
        if (targetChannel) {
            await targetChannel.send({ files: [audioFile] });
            console.log(`Audio forwarded to channel ${channelId}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to forward audio:', error);
        return false;
    }
}

async function sitMan(client, channelId, msgToSend) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            await channel.send(msgToSend);
            console.log(`"destination: ${channelId}   message: ${msgToSend}"`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('sit man hogya', error);
        return false;
    }
}

module.exports.sitMan = sitMan;