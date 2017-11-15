import {
    EntityRecognizer,
    LuisRecognizer
} from 'botbuilder';

function extractCustomerEntity(session, args, next) {
    console.log("Builder found " + JSON.stringify(args));

    var customerName = EntityRecognizer.findEntity(args.intent.entities, 'CustomerName');

    if(customerName) {
        //session.send("I see you're looking for an address for " + customerName.entity + "...");        
        next({ customerName: customerName.entity });
    } else {
        session.send('Sorry, I can\'t answer that.');
    }
}

function extractSalesAmountPrefixAndPeriod(session, args, next) {
    console.log("Builder found " + JSON.stringify(args));
    
        var prefixEntity = EntityRecognizer.findEntity(args.intent.entities, 'prefixperiod');
        var periodEntity = EntityRecognizer.findEntity(args.intent.entities, 'Period');
    
        if(periodEntity) {

            var prefix = "";
            if (prefixEntity != null) {
                prefix = prefixEntity.entity;
            }
            
            next({ prefix: prefix, period: periodEntity.entity});
        } else {
            session.send('Sorry, I can\'t answer that.');
        }
}

function noEntity(session, args, next) {
    console.log("Builder found " + JSON.stringify(args));
    console.log(session);
    next();
}

var initLuis = function(bot): any {
    bot.recognizer(new LuisRecognizer(process.env.LUIS_ENDPOINT as string));
} 

export {
    initLuis,
    extractCustomerEntity,
    extractSalesAmountPrefixAndPeriod,
    noEntity
};