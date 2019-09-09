
export default {

    recommendations: [
        {
            src: require('../../assets/images/threat-critical.png'),
            overview: 'One or more indications of compromise was identified in your message.  Follow our recommended actions below:',
            tips: [
                'Delete email',
                'Do not open attachments',
                'Do not click on links',
                'Stop Cyber Crime – visit '
            ],
            proTips: [
                'Review email, server, and firewall logs',
                'Identify bad IPs, domains, and hashes',
                'Compare with free threat intelligence at '
            ]
        },
        {
            src: require('../../assets/images/threat-guarded.png'),
            overview: 'Even though we didn’t find a direct malicious indicator in your message, always be mindful of potential compromises as they change on a regular basis. Follow our general tips below:',
            tips: [
                'Verify sender address',
                'Exercise caution when opening email unexpected senders',
                'Scan attachments prior to opening',
                'Suspicious requests often indicate malicious intent',
                'Don’t fall for poorly worded scams'
            ]
        }
    ]

}