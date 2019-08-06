import React from 'react'
import { AsyncStorage, Text, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import axios from 'axios';
import style from '../../../style'


export default class SignIn extends React.Component {

    login() {
        axios.post(`${global.BASE_URL}/auth/login`, {
            email: this.state.email,
            password: this.state.password
        })
            .then(resp => {
                console.log(resp)
                // Sets session token and user email for requests
                AsyncStorage.multiSet([['token', resp.headers.authorization], ['email', this.state.email]], () => {
                    this.props.navigation.navigate('Dashboard')
                });
            })
            .catch(err => console.error(err))
    }

    render() {
        return (
            <View style={[style.body, {flex: 1, justifyContent: 'center'}]}>
                <View >
                    <Text style={style.h3}>Sign in to your account</Text>
                    <Input
                        placeholder='Email Address'
                        placeholderTextColor='#707992'
                        inputStyle={{color: '#fff'}}
                        onChangeText={email => this.setState({ email })}
                        autoCapitalize='none'
                    />
                    <Input
                        placeholder='Password'
                        placeholderTextColor='#707992'
                        inputStyle={{color: '#fff'}}
                        secureTextEntry
                        autoCapitalize='none'
                        onChangeText={password => this.setState({ password })}
                    />
                </View>
                <View>

                    <Button
                        title='Done'
                        type='clear'
                        onPress={this.login.bind(this)}
                        // buttonStyle={{ alignSelf: 'flex-start !important' }}
                        containerStyle={{ display: 'flex', alignItems: 'flex-end' }}
                    />
                </View>
            </View>
        )
    }
}