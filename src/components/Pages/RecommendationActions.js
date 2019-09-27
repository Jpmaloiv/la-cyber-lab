import React from 'react'
import { Image, ImageBackground, Linking, ScrollView, TouchableOpacity, View } from 'react-native'
import { Divider, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import IconAnt from 'react-native-vector-icons/AntDesign'
import text from '../../text/RecommendationActions'
import style from '../../../style'


export default class RecommendationActions extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            actions: { tips: [] }
        }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <IconAnt name='arrowleft' color='#fff' size={30} />
                </TouchableOpacity>
            )
        }
    }

    componentDidMount() {
        const { navigation } = this.props;
        let src, desc
        let alertLevel = navigation.getParam('alertLevel').toLowerCase()

        switch (alertLevel) {
            case 'low': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-low.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#73ae57', fontWeight: 'bold' }}>LOW </Text>indicates a low risk. No unusual activity exists beyond the normal concern for known hacking activities, known viruses, or other malicious activity.</Text>
                break;
            case 'guarded': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-guarded.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#2c91b3', fontWeight: 'bold' }}>GUARDED </Text>indicates a general risk of increased hacking, virus, or other malicious activity.</Text>
                break;
            case 'elevated': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-elevated.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#ecde29', fontWeight: 'bold' }}>ELEVATED </Text>indicates a significant risk due to increased hacking, virus, or other malicious activity that compromises systems or diminishes service.</Text>
                break;
            case 'high': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-high.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#f37043', fontWeight: 'bold' }}>HIGH </Text>indicates a high risk of increased hacking, virus, or other malicious cyber activity that targets core/critical infrastructure to cause multiple service outages and system compromises.</Text>
                break;
            case 'severe': src = <Image style={{ width: 79, height: 20 }} source={require('../../../assets/images/threat-severe.png')} />
                desc = <Text style={{ fontSize: 12 }}><Text style={{ color: '#d0122f', fontWeight: 'bold' }}>SEVERE </Text>indicates a severe risk of hacking, virus, or other malicious activity resulting in widespread outages and/or significantly destructive compromises to systems or critical infrastructure sectors.</Text>

        }
        this.setState({
            actions: text[alertLevel],
            alertLevel,
            src,
            desc
        })
    }

    render() {

        console.log("HERE", this.state.src)
        let { actions } = this.state


        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={[style.h3, { alignSelf: 'center' }]}>State of Affairs</Text>


                <ScrollView showsVerticalScrollIndicator={false}>
                    <ImageBackground source={require('../../../assets/images/threat-bg.png')} style={{ width: '100%', height: 200, marginTop: 10 }}>
                        <View style={{ margin: 25, flex: 1, justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ color: '#707992', fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Security State of Affairs</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={style.h3}>THREAT LEVEL</Text>
                                    {this.state.src}
                                </View>
                            </View>
                            <Text>{this.state.desc}</Text>
                        </View>
                    </ImageBackground>

                    <Divider style={{ height: 2, marginVertical: 15, backgroundColor: '#737589' }} />

                    <Text style={[style.h5, { fontStyle: 'italic', marginBottom: 5 }]}>Recommendations</Text>
                    {actions.tips.map((tip, tipIndex) => (
                        <View key={tipIndex}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 34, margin: 10, marginLeft: 0, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name='asterisk' color='#fb4968' size={15} />
                                </View>
                                <View style={{ flex: 1, marginVertical: 5 }}>
                                    <Text>{tip}</Text>
                                </View>
                            </View>

                            {tipIndex != actions.tips.length - 1 && <Divider style={{ height: 1, backgroundColor: '#737589' }} />}
                        </View>
                    ))}
                    <View style={{ backgroundColor: '#202642', borderRadius: 8, padding: 15, marginTop: 20 }}>
                        <Text style={{ fontSize: 12 }}>For more information, please visit:</Text>
                        <Text style={{ fontSize: 14, color: '#faf549', textDecorationLine: 'underline', marginTop: 5 }} onPress={() => Linking.openURL('https://www.cisecurity.org/cybersecurity-threats/alert-level/').catch((err) => console.log('An error occurred', err))}>https://www.cisecurity.org/cybersecurity-threats/alert-level/</Text>
                    </View>

                </ScrollView>
            </View>

        )
    }
}