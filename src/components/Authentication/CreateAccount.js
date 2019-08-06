
import React, { Component } from 'react';
import { Text, View } from 'react-native'
import { Button, Input } from 'react-native-elements'
import style from '../../../style'


export default class CreateAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    // static navigationOptions = ({ navigation }) => {
    //     return {
    //         headerLeft: (
    //             <Button title='Cancel' type='clear' titleStyle={style.header} onPress={() => navigation.goBack()} />
    //         ),
    //         headerRight: (
    //             <Button title='Sign In' type='clear' titleStyle={style.header} onPress={() => navigation.navigate('SignIn')} />
    //         )
    //     }
    // }

    // Checks if email addresses match, navigates to next screen
    next() {
        if (this.state.email === this.state.confirmEmail)
            this.props.navigation.navigate('CreatePassword', {
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email
            })
        else this.setState({ error: 'Email addresses do not match' })
    }

    render() {

        if (this.state.email === this.state.confirmEmail && this.state.error) this.setState({ error: '' })

        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={{ fontSize: 20, alignSelf: 'flex-start', marginBottom: 15 }}>Create your account</Text>

                <View>
                    <Text style={style.h6}>Name</Text>
                    <Input
                        placeholder='First Name'
                        placeholderTextColor='#707992'
                        inputStyle={{color: '#fff'}}
                        onChangeText={firstName => this.setState({ firstName })}
                    />
                    <Input
                        placeholder='Last Name'
                        placeholderTextColor='#707992'
                        inputStyle={{color: '#fff'}}
                        onChangeText={lastName => this.setState({ lastName })}
                    />
                </View>
                <View>

                <Text style={[style.h6, {marginTop: 10}]}>Email</Text>
                    <Input
                        placeholder='Enter Email Address'
                        placeholderTextColor='#707992'
                        inputStyle={{color: '#fff'}}
                        autoCapitalize='none'
                        onChangeText={email => this.setState({ email })}
                    />
                    <Input
                        placeholder='Confirm Email Address'
                        placeholderTextColor='#707992'
                        inputStyle={{color: '#fff'}}
                        autoCapitalize='none'
                        onChangeText={confirmEmail => this.setState({ confirmEmail })}
                        errorMessage={this.state.error}
                    />
                </View>

                <Button
                    title="NEXT"
                    titleStyle={{ fontSize: 14 }}
                    buttonStyle={[style.button, { alignSelf: 'center' }]}
                    onPress={this.next.bind(this)}
                />
            </View>
        );
    }
}
