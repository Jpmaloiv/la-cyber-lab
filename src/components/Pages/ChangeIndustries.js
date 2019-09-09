
import React from 'react';
import constants from '../../../constants'
import { Alert, Button, ScrollView, Text, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import style from '../../../style'
import axios from 'axios';


export default class ChangesectorIds extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sectorIds: [],
            sectors: []
        }
    }

    // Passes updated sectors back to profile screen
    static goBack(navigation) {
        navigation.state.params.onGoBack(navigation.state.params.sectorIds);
        navigation.goBack()
    }

    static navigationOptions = ({ navigation }) => ({
        headerLeft: (
            <Button
                onPress={() => this.goBack(navigation)}
                title="< Back"
                color="#fff"
            />
        ),
    });

    componentDidMount() {
        axios.get(`${constants.BASE_URL}/sectors`, { headers: { 'Authorization': constants.AUTHORIZATION_TOKEN } })
            .then(resp => {
                console.log(resp)
                let sectors = resp.data.userSectors

                this.setState({ sectors, sectorIds: this.props.navigation.state.params.sectorIds })
            })
            .catch(err => console.log(err))
    }


    render() {

        const { sectors, sectorIds } = this.state

        console.log(this.state)

        return (
            <View style={[style.body, { flex: 1, marginBottom: 50 }]}>
                <Text style={[style.h3, { marginVertical: 5 }]}>What industry are you in?</Text>
                <Text style={[style.h5, { marginVertical: 5, marginBottom: 10}]}>Select All That Apply</Text>
                <ScrollView>

                    {sectors.map((el, i) =>
                        <CheckBox
                            center
                            title={el.sectorDescription}
                            key={el.userSectorId}
                            containerStyle={{alignItems:"flex-start", backgroundColor: 'transparent' }}
                            textStyle={{ color: '#fff' }}
                            checkedIcon='dot-circle-o'
                            
                            uncheckedIcon='circle-o'
                            checked={sectorIds.includes(el.userSectorId)}
                            // Toggles industry selection up to 3 choices
                            onPress={() => {
                                sectorIds.includes(el.userSectorId)
                                    ? sectorIds.splice(sectorIds.indexOf(el.userSectorId), 1)
                                    : sectorIds.length != 3
                                        ? sectorIds.push(el.userSectorId)
                                        : Alert.alert(
                                            'Maximum of 3 Industries Allowed',
                                            '',
                                            [{ text: 'OK' }],
                                            { cancelable: false },
                                        )
                                this.props.navigation.setParams({ sectorIds })
                                this.setState({ render: !this.state.render })
                            }}

                        />
                    )}
                </ScrollView>
            </View>
        );
    }

}