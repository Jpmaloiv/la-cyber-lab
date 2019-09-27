import React from 'react'
import { Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-elements'
import style from '../../../style'


export default class Welcome extends React.Component {
    render() {
        return (
            <ImageBackground source={require('../../../assets/images/welcome.png')} style={{ width: '100%', flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={{flex: 1}}></View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Image source={require('../../../assets/lacl.png')} style={{ alignSelf: 'center', width: 250, height: 140 }} />
                    </View>
                </View>
                <View style={[style.body, { flex: 3, justifyContent: 'space-evenly', paddingTop: 0 }]}>
                    <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20 }}>Welcome to</Text>
                        <Text style={{ fontSize: 35, fontWeight: 'bold' }}>LA CYBER LAB</Text>
                        <Text style={{ fontSize: 15, lineHeight: 20 }}>Protection Through Partnership</Text>
                    </View>

                    <View style={{ display: 'flex', flex: 1, justifyContent: 'space-evenly', alignItems: 'center' }}>
                        <View>
                            <Button
                                title='Create Account'
                                titleStyle={{ fontSize: 15, fontWeight: '900' }}
                                buttonStyle={[style.button, { height: 55, width: '100%', alignSelf: 'center' }]}
                                onPress={() => this.props.navigation.navigate('CreateAccount')}
                            />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                            <Text style={{ fontSize: 15 }}>Already have an account? </Text>
                            <TouchableOpacity>
                                <Text
                                    style={{ fontSize: 15, color: '#fa4969', fontWeight: 'bold' }}
                                    onPress={() => this.props.navigation.navigate('SignIn')}
                                >
                                    Sign in
                            </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        )
    }
}

