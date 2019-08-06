import React from 'react'
import { Text, View } from 'react-native'
import { Button } from 'react-native-elements'
import style from '../../../style'


export default class Welcome extends React.Component {
    render() {
        return (
            <View style={[style.body, { flex: 1, justifyContent: 'space-evenly' }]}>
                <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={style.h1}>Welcome to</Text>
                    <Text style={[style.h1, {  marginBottom: 5 }]}>LA CYBER LAB</Text>
                    <Text style={{ fontSize: 15, lineHeight: 20 }}>Protecting our community</Text>
                </View>

                <View style={{ display: 'flex', flex: 1, justifyContent: 'space-evenly', alignItems: 'center' }}>
                    <Button
                        title='Create Account'
                        titleStyle={{ fontSize: 14 }}
                        buttonStyle={style.button}
                        onPress={() => this.props.navigation.navigate('CreateAccount')}
                    />
                    <View style={{ alignSelf: 'center' }}>
                        <Text style={{ fontSize: 18, marginBottom: 5 }}>Already have an account?</Text>
                        <Text
                            style={{ fontSize: 20, color: '#169aff', textAlign: 'center' }}
                            onPress={() => this.props.navigation.navigate('SignIn')}
                        >
                            Sign in Here
                    </Text>
                    </View>
                </View>
            </View>
        )
    }
}

