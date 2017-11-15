import {
    IChatConnectorSettings,
    ChatConnector,
    UniversalBot
} from 'botbuilder';

import { 
    initLuis,
    extractCustomerEntity,
    extractSalesAmountPrefixAndPeriod,
    noEntity
} from './luis';

import {
    findCustomer,
    findCreditLimit,
    findCompanies,
    findSalesAmountOfPeriod
} from './navision';

const settings: IChatConnectorSettings = {
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
};

var connector = new ChatConnector(settings);
var bot = new UniversalBot(connector);

initLuis(bot);

bot.dialog("GetCustomerAddress", [
    // Waterfal dialog
    extractCustomerEntity,
    findCustomer
])
.triggerAction({
    matches: 'GetCustomerAddress'
})

bot.dialog("GetCreditLimit", [
    // Waterfall Dialog  
    extractCustomerEntity,
    findCreditLimit
  ])
  .triggerAction({
      matches: 'GetCreditLimit'
  })
  
  bot.dialog("GetCompanies", [
    // Waterfall Dialog
    noEntity,
    findCompanies
  ])
  .triggerAction({
      matches: 'GetCompanies'
  })
  
  bot.dialog("GetSalesAmountOfPeriod", [
    // Waterfall Dialog
    extractSalesAmountPrefixAndPeriod,
    findSalesAmountOfPeriod
  ])
  .triggerAction({
      matches: 'GetSalesAmountOfPeriod'
  })
  
    

bot.dialog("/", function(session) {
    session.send("Sorry, I don't understand your request")
})

export {
    connector,
    bot
};