
export default {
    low: {
        src: require('../../assets/images/threat-low.png'),
        tips: [
            'Continue routine preventive measures, i.e. update antivirus, scan attachments.',
            'Continue routine security monitoring.',
            'Ensure personnel receive proper training on cybersecurity policies.',
        ]
    },
    guarded: {
        src: require('../../assets/images/threat-guarded.png'),
        tips: [
            'Continue routine preventative measures and security monitoring.',
            'Identify vulnerable systems.',
            'Implement countermeasures to protect vulnerable systems.',
            'When available, test and implement patches and install anti-virus updates in the next regular cycle.'
        ]
    },
    elevated: {
        src: require('../../assets/images/threat-elevated.png'),
        tips: [
            'Identify vulnerable systems.',
            'Increase monitoring of critical systems.',
            'Immediately implement appropriate countermeasures to protect vulnerable critical systems.',
            'When available, test and implement patches and install anti-virus updates as soon as possible.'
        ]
    },
    high: {
        src: require('../../assets/images/threat-high.png'),
        tips: [
            'Closely monitor security mechanisms, including firewalls, web log files, and anti-virus for unusual activity.',
            'Consider limiting or shutting down less critical connections to external networks such as the Internet.',
            'Consider the use of alternative methods of communication, such as phone, fax, or radio in lieu of email and other forms of electronic communication.',
            'When available, test and implement patches and update anti-virus immediately.'
        ]
    },
    severe: {
        src: require('../../assets/images/threat-severe.png'),
        tips: [
            'Shut down connections to the Internet and external business partners until appropriate corrective actions are taken.',
            'Isolate internal networks to contain or limit the damage or disruption.',
            'Use alternative methods of communication, such as phone, fax, or radio as necessary in lieu of email and other forms of electronic communication.',
            'When available, test and implement patches and update anti-virus immediately.'
        ]
    }

}