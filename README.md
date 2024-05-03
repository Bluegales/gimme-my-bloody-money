# gimme-my-bloody-money
This project creates a straightforward way of requesting money. Users can generate a link, which others can click to directly sign the correct transaction.

## description
This project simplifies the process of requesting money through a straightforward, two-page online system.
On the first page, the request page, users fill out a form where they specify their own receiving address, what currency they want, and how much. After filling out the form, a link gets generated that the user can send to others. 
When someone clicks on this link, they're taken to the second page, the payment page.
The payment page allows the person who received the link to check the details of the money request to make sure everything is correct. They can then approve and sign the transaction right there. 
For added credibility, there's an option for the user creating the request to verify with WorldID, this shows the user that the request comes from a human and not from a bot sending out requests to random people. Additionally, people who receive these requests have the ability to mark them as either spam or legitimate, also signing with WorldID. This helps quickly identify and reduce potential scams, as wallets with a negative reputation score will be marked as dangerous on the payment page. 
If the recipient doesn’t have enough of the requested currency, the system can automatically find and use funds from other chains, utilising CCIP.
Finally, the system also provides options for requesting money to your bank account utilising the Unlimit offramp, and paying with fiat using the Unlimit onramp.


## technical
TODO add the smart contract worldcoin reputation stuff

The frontend consists of 2 pages both using React, both of them only interact with the blockchain and don’t require any backend.
The request page generates the link without making any smart contract calls. All the necessary information (chain, recipient address, currency, amount) is simply put into the query parameters of the generated link, making the process as simple as possible. If the user decides to verify himself with WorldID, he has to connect with his wallet, then scan the worldID Qr code using the IDKitWidget provided by worldcoin. This address is then marked as being a human.
The payment page gets all the information from the query parameters and displays it to the user to verify. In the most simple case, where enough funds are available on the specified currency on the correct chain the user can simply sign this transaction. If the frontend detects that not enough funds are available on the expected chain it tries to find a chain with enough funds and bridge it directly to the recipients address using Chainlink CCIP. If no funds can be found at all, the user is instead offered the option to onramp the funds using Unlimit. In case the requester specified, that he would like to receive his funds in fiat, the Unlimit Offramp is used to pay the user directly to his bank account instead.
