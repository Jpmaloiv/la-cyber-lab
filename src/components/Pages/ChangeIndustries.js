
import React from 'react';
import constants from '../../../constants'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { CheckBox } from 'react-native-elements'
import Icon from 'react-native-vector-icons/AntDesign'
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
            <TouchableOpacity onPress={() => this.goBack(navigation)}>
                <Icon name='arrowleft' color='#fff' size={30} />
            </TouchableOpacity>
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

        return (
            <View style={[style.body, { flex: 1, marginBottom: 50 }]}>
                <View style={{ marginBottom: 15 }}>
                    <Text style={style.h1}>What Industry</Text>
                    <Text style={style.h1}>Are You In?</Text>
                </View>

                <Text style={{ fontSize: 15, color: '#f5bd00', marginTop: 10, marginBottom: 25 }}>Select All That Apply</Text>

                <ScrollView>
                    {sectors.map((el, i) =>
                        <CheckBox
                            iconRight
                            title={el.sectorDescription}
                            key={el.userSectorId}
                            containerStyle={{ paddingHorizontal: 0, paddingVertical: 15, marginHorizontal: 0, marginVertical: 0, alignItems: 'flex-end', backgroundColor: 'transparent', borderWidth: 0, borderTopWidth: 1, borderColor: '#333957' }}
                            textStyle={{ flex: 1, marginLeft: 0, fontSize: 15, fontWeight: '500', color: '#707992' }}
                            checkedIcon={<Icon name='checkcircleo' size={25} color='#f5bd00' />}
                            uncheckedIcon={<View style={{ borderWidth: 1, borderColor: "#fff", backgroundColor: '#202642', height: 25, width: 25, borderRadius: 50 }} />}
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