const request = require("request-promise");
require("dotenv").config();

var moment = require("moment");
moment.locale("fr");

var clanTag = "";

module.exports = message => {
  message.channel
    .send({
      embed: {
        color: 0xf8f8ff,
        title:
          ":crossed_swords: Pour quel clan souhaites-tu contrôler les combats effectués lors de la dernière guerre ?",
        fields: [
          { name: "Suisse Romande", value: "1️⃣", inline: true },
          { name: "Suisse Romande2", value: "2️⃣", inline: true },
          { name: "Suisse Romande3", value: "3️⃣", inline: true },
          { name: "Suisse Romande4", value: "4️⃣", inline: true },
          { name: "Infinity Night", value: "♾", inline: true }
        ]
      }
    })
    .then(m => m.react("1️⃣"))
    .then(r => r.message.react("2️⃣"))
    .then(r => r.message.react("3️⃣"))
    .then(r => r.message.react("4️⃣"))
    .then(r => r.message.react("♾"));

  message.channel
    .fetchMessages({ limit: 1 })
    .then(messages => {
      let lastMessage = messages.first();

      // If the author of the last message was a bot
      if (lastMessage.author.bot) {
        const filter = (reaction, user) => {
          return (
            ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "♾"].includes(reaction.emoji.name) &&
            user.id === message.author.id
          );
        };

        lastMessage
          .awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] })
          .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === "1️⃣") {
              clanTag = "2QCYRPL2";
            }
            if (reaction.emoji.name === "2️⃣") {
              clanTag = "9UPLYLCY";
            }
            if (reaction.emoji.name === "3️⃣") {
              clanTag = "RVY80CG";
            }
            if (reaction.emoji.name === "4️⃣") {
              clanTag = "PUPJ9GUL";
            }
            if (reaction.emoji.name === "♾") {
              clanTag = "PVYYQJGG";
            }
          })
          .catch(collected => {
            message.reply(
              "Merci de relancer la commande `/checkWar` et de cliquer sur une des réactions pour choisir un clan !"
            );
          })
          .then(() => {
            request({
              uri: `https://api.clashroyale.com/v1/clans/%23${clanTag}/warlog`,
              headers: {
                Authorization: `Bearer ${process.env.CR_API_KEY}`
              },
              json: true
            })
              .then(res => {
                // Array with the informations about all the clans participating to the war
                var arrayClans = res.items[0].standings;

                // Array with the Suisse Romande clan informations
                var arraySuisseRomandeClan = [];

                // Array with all the war participants stats
                var arrayParticipants = res.items[0].participants;

                // Array with the participants who missed their match during the collection day
                var arrayCollectionDay = [];

                // Array with the participants who missed their final battle
                var arrayFinalBattle = [];

                for (let i = 0; i < arrayClans.length; i++) {
                  if (arrayClans[i].clan.tag == "#" + clanTag) {
                    arraySuisseRomandeClan.push({
                      name: arrayClans[i].clan.name,
                      clanScore: arrayClans[i].clan.clanScore,
                      participants: arrayClans[i].clan.participants,
                      battlesPlayed: arrayClans[i].clan.battlesPlayed,
                      wins: arrayClans[i].clan.wins,
                      crowns: arrayClans[i].clan.crowns,
                      trophyChange: arrayClans[i].trophyChange,
                      warPosition: [i + 1]
                    });
                  }
                }

                arrayParticipants.forEach(function(participant) {
                  // Add to the array the participants who missed their match during the collection day
                  if (participant.collectionDayBattlesPlayed < 3) {
                    arrayCollectionDay.push({
                      name: participant.name,
                      collectionDayBattlesPlayed:
                        participant.collectionDayBattlesPlayed
                    });
                  }

                  // Add to the array the participants who missed their final battle
                  if (participant.battlesPlayed < participant.numberOfBattles) {
                    arrayFinalBattle.push({
                      name: participant.name,
                      battlesPlayed: participant.battlesPlayed,
                      numberOfBattles: participant.numberOfBattles
                    });
                  }
                });

                // Array with structured data for embedded message that contains the informations about the participants who missed their match during the collection day
                var arrayFieldsCollectionDay = [];

                arrayCollectionDay.forEach(function(arrayCollectionDay) {
                  arrayFieldsCollectionDay.push({
                    name: arrayCollectionDay.name,
                    value:
                      "Il a effectué " +
                      arrayCollectionDay.collectionDayBattlesPlayed +
                      " combat(s) de collecte sur 3"
                  });
                });

                var endWarDate = moment(res.items[0].createdDate)
                  .utc()
                  .format("Do MMMM YYYY à HH:mm:ss");

                message.channel.send({
                  embed: {
                    color: 0x0099ff,
                    title: arraySuisseRomandeClan[0].name,
                    url: "https://royaleapi.com/clan/" + clanTag,
                    description:
                      ":calendar: La dernière guerre de clan s'est terminée le " +
                      endWarDate +
                      "\n\n:medal: Le clan est arrivé à la " +
                      arraySuisseRomandeClan[0].warPosition +
                      " position !" +
                      "\n\n:trophy: Le nombre de trophées de guerre est maintenant de " +
                      arraySuisseRomandeClan[0].clanScore +
                      " (différence de " +
                      arraySuisseRomandeClan[0].trophyChange +
                      " trophées)" +
                      "\n\n:muscle: Il y a eu " +
                      arraySuisseRomandeClan[0].participants +
                      " participants à cette guerre" +
                      "\n\n:axe: " +
                      arraySuisseRomandeClan[0].battlesPlayed +
                      " combats de guerre ont été lancés et " +
                      arraySuisseRomandeClan[0].wins +
                      " ont été gagnés" +
                      "\n\n:crown: " +
                      arraySuisseRomandeClan[0].crowns +
                      " couronnes ont été accumulées lors de cette guerre"
                  }
                });

                message.channel.send({
                  embed: {
                    color: 0x0099ff,
                    title: "Classement",
                    description:
                      ":first_place: " +
                      arrayClans[0].clan.name +
                      " est arrivé 1er" +
                      "\n\n:second_place: " +
                      arrayClans[1].clan.name +
                      " est arrivé 2ème" +
                      "\n\n:third_place: " +
                      arrayClans[2].clan.name +
                      " est arrivé 3ème" +
                      "\n\n:chocolate_bar: " +
                      arrayClans[3].clan.name +
                      " est arrivé 4ème" +
                      "\n\n:man_facepalming: " +
                      arrayClans[4].clan.name +
                      " est arrivé 5ème"
                  }
                });

                // Display the embedded message if arrayFieldsCollectionDay is not empty
                if (
                  arrayFieldsCollectionDay &&
                  arrayFieldsCollectionDay.length > 0
                ) {
                  message.channel.send({
                    embed: {
                      color: 0xffff00,
                      title:
                        ":warning: " +
                        arrayFieldsCollectionDay.length +
                        " membres ont manqués leurs combats de collecte",
                      fields: arrayFieldsCollectionDay
                    }
                  });
                } else {
                  message.channel.send({
                    embed: {
                      color: 0x32cd32,
                      title:
                        ":thumbsup: Aucun membre n'a manqué ses combats de collecte !"
                    }
                  });
                }

                // Array with structured data for embedded message that contains the informations about the participants who missed their final battle
                var arrayFieldsFinalBattle = [];

                arrayFinalBattle.forEach(function(arrayFinalBattle) {
                  arrayFieldsFinalBattle.push({
                    name: arrayFinalBattle.name,
                    value:
                      "Il a effectué " +
                      arrayFinalBattle.battlesPlayed +
                      " combat(s) de guerre sur " +
                      arrayFinalBattle.numberOfBattles
                  });
                });

                // Display the embedded message if arrayFieldsFinalBattle is not empty
                if (
                  arrayFieldsFinalBattle &&
                  arrayFieldsFinalBattle.length > 0
                ) {
                  message.channel.send({
                    embed: {
                      color: 0xff0000,
                      title:
                        ":rage: " +
                        arrayFieldsFinalBattle.length +
                        " membres ont manqués leur(s) combat(s) de guerre",
                      fields: arrayFieldsFinalBattle
                    }
                  });
                } else {
                  message.channel.send({
                    embed: {
                      color: 0x32cd32,
                      title:
                        ":raised_hands: Aucun membre n'a manqué son combat de guerre !"
                    }
                  });
                }
              })
              .catch(err => {
                console.log(err);
              });
          });
      }
    })
    .catch(console.error);
};
