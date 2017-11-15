import { 
    createClient,
    BasicAuthSecurity
} from 'soap';

import { parseString } from 'xml2js';

const navAuth = "Basic " + new Buffer(
    process.env.NAV_USERNAME + ':' + process.env.NAV_PASSWORD
).toString("base64");

const authHeader = { 
    wsdl_headers: { 
        Authorization: navAuth
    } 
}

var runNAVSoapFunction = function(session, functionname, args) {
    createClient(process.env.NAV_ENDPOINT as string, authHeader, (err, client: any) => {
        if (err) {
            console.log(err);            
        } else {
            client.setSecurity(new BasicAuthSecurity(process.env.NAV_USERNAME as string, process.env.NAV_PASSWORD as string));
            functionname(session, client, args);
        }
    })
}


var getCustomerAddress = function soapNAVGetCustomerAddress(session, client, args) {
    client.GetCustomerAddress({customerNoOrName: args[0]}, function(error, result) {
        if(error) {
            session.send(error)
        } else {
            // XML is returned from NAV, convert to JSON
            parseString(result.return_value, function(err, xml2jsonResult) {
                if(!err) {
                    if (xml2jsonResult.CustomerAddress.Address != null ) 
                    {
                        session.send("I found the following address(es):");
                        xml2jsonResult.CustomerAddress.Address.forEach(adr => {
                            session.send(adr);                                    
                        }); 
                    } else {
                        session.send("Sorry! I can't find any addresses that matches '" + args[0] + "'");
                    }
                                }
            })
        }
    });

}

var getCreditLimit = function soapNAVGetCreditLimit(session, client, args) {
     client.GetCreditLimit({customerNoOrName: args[0]}, function(error, result) {
        if(error) {
            session.send(error)
        } else {
            // XML is returned from NAV, convert to JSON
            parseString(result.return_value, function(err, xml2jsonResult) {
                if(!err) {
                    if (xml2jsonResult.CustomerCreditLimit.Name != null) {
                        session.send("The credit limit of " + xml2jsonResult.CustomerCreditLimit.Name + ' is ' + xml2jsonResult.CustomerCreditLimit.CreditLimit);
                    } else {
                        session.send("Sorry! I can't find any customer that matches '" + args[0] + "'");
                    }
                }
            })            
        }
    });
}

var getCompanies = function soapNAVGetCompanies(session, client) {
    client.GetCompanies({}, function(error, result) {
        if (error) {
            session.send(error);
        } else {            
            parseString(result.return_value, function(err, xml2jsonResult) {
                if (!err) {
                    session.send("I found the following companies:");
                    xml2jsonResult.companies.company.forEach(adr => {
                        session.send(adr);                                    
                    }); 
            }
            })
        }
    })
}

var getSalesAmountOfPeriod = function soapNAVGetSalesAmountOfPeriod(session, client, args) {
    client.GetSalesAmountOfPeriod({prefix: args[0], period: args[1], customerNo: args[2]}, function(error, result) {
        if (error) {
            session.send(error);
        } else {
            
            parseString(result.return_value, function(err, xml2jsonResult) {
                if (!err) {
                    
                    console.log(xml2jsonResult);
                    var amount : number = parseFloat(xml2jsonResult.AmountPerPeriod.Amount);
                    var currency = xml2jsonResult.AmountPerPeriod.Currency;
                    var periodstart = xml2jsonResult.AmountPerPeriod.PeriodStart;
                    var periodend =  xml2jsonResult.AmountPerPeriod.PeriodEnd;
                    
                    console.log(args);
                    if (amount > 0) {
                        
                        if (args[1] != 'today') {
                            session.send("The sales amount in period " + periodstart + ".." + periodend + " was " + amount.toFixed(2) + " " + currency + ".");
                        } else {
                            session.send("The today's sales amount is " + amount.toFixed(2) + " " + currency + ".");
                        }
                    } else {
                        session.send("Sorry, but you didn't sell something in this period!");
                    }
                }
            })
        }        
    })
}

var findCustomer = function(session, data) {
    console.log(data);
    runNAVSoapFunction(session, getCustomerAddress, [data.customerName]);
}

var findCreditLimit = function(session, data) {
    console.log(data);    
    runNAVSoapFunction(session, getCreditLimit, [data.customerName]);
}

var findCompanies = function(session, data) {
    console.log(data);
    runNAVSoapFunction(session, getCompanies, []);
}

var findSalesAmountOfPeriod = function(session, data) {
    console.log(data);
    runNAVSoapFunction(session, getSalesAmountOfPeriod, [data.prefix, data.period, ""]);
}

export {
    findCustomer,
    findCreditLimit,    
    findSalesAmountOfPeriod,
    findCompanies
}