import React from 'react'
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import { Button, CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import IconAnt from 'react-native-vector-icons/AntDesign'
import style from '../../../style'


export default class AccountType extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
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

    render() {

        return (
            <View style={[style.body, {flex: 1}]}>
                <View style={{ marginBottom: 15 }}>
                    <Text style={style.h1}>What Type of</Text>
                    <Text style={style.h1}>Account is This?</Text>
                </View>

                <ImageBackground style={{ width: '100%', height: 125, marginVertical: 10 }} borderRadius={5} source={require('../../../assets/images/business.png')}>
                    <TouchableOpacity
                        onPress={() => this.setState({ accountType: 'business' })}
                        activeOpacity={.7}
                        style={{ padding: 20, backgroundColor: 'linear-gradient(270deg, rgba(41,47,78,0.85) 0%, #292F4E 100%);', borderWidth: this.state.accountType === 'business' && 1.5, borderColor: '#f5bd00', flex: 1 }}
                    >
                        <Icon name={this.state.accountType === 'business' ? 'dot-circle-o' : 'circle-o'} size={25} color='#fff' style={{ alignSelf: 'flex-end' }} />
                        <Text style={style.h3}>BUSINESS</Text>
                    </TouchableOpacity>
                </ImageBackground>

                <ImageBackground style={{ width: '100%', height: 125, marginVertical: 10 }} borderRadius={5} source={require('../../../assets/images/personal.jpg')}>
                    <TouchableOpacity
                        onPress={() => this.setState({ accountType: 'personal' })}
                        activeOpacity={.7}
                        style={{ padding: 20, backgroundColor: 'linear-gradient(270deg, rgba(41,47,78,0.85) 0%, #292F4E 100%);', borderWidth: this.state.accountType === 'personal' && 1.5, borderColor: '#f5bd00', flex: 1 }}
                    >
                        <Icon name={this.state.accountType === 'personal' ? 'dot-circle-o' : 'circle-o'} size={25} color='#fff' style={{ alignSelf: 'flex-end' }} />
                        <Text style={style.h3}>PERSONAL</Text>
                    </TouchableOpacity>
                </ImageBackground>

                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Button
                        title="NEXT"
                        titleStyle={{ fontSize: 15, fontWeight: '900' }}
                        buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                        onPress={() => {
                            this.state.accountType === 'personal' ? this.props.navigation.state.params.industries = [1] : []
                            this.state.accountType === 'business' ? this.props.navigation.navigate('IndustrySelect', this.props.navigation.state.params) : this.props.navigation.navigate('LocationSelect', this.props.navigation.state.params)
                        }}
                        disabled={!this.state.accountType}
                        disabledStyle={{ backgroundColor: '#fa496975' }}
                    />
                </View>

            </View>
        )
    }
}