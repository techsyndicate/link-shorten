const Link = require('../schemas/linkSchema.js');

const blChannelId = process.env.BL_CHANNEL_ID;
const publicCrossId = process.env.PUBLIC_CROSS_ID;
const privateCrossId = process.env.PRIVATE_CROSS_ID;

module.exports = async (client, message) => {
    if (!message.author.bot) {
        if(message.content == 'ts sit man'){
            console.log(message.channelId);
            forwardMessage(client, message,message.channelId,"sit man");
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
                                content += `**Name**: ${link.name}, **Short**: ${link.backlink}, **Link**: ${link.link}\n`;
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
                
                    // if (errors.length > 0) {
                    //     return sendMessage(message, {errors})
                    // }
                    
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

                if(bl[1]== 'sitman'){
                    forwardMessage(client, message, blChannelId, 'sit man');
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