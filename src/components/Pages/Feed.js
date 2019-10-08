import React from 'react'
import { ActivityIndicator, FlatList, Image, Linking, Platform, Share, Text, TouchableOpacity, StyleSheet, View } from 'react-native'
import { Divider } from 'react-native-elements'
import HTMLView from 'react-native-htmlview';
import moment from 'moment'
import Icon from 'react-native-vector-icons/AntDesign'
import { connect } from "react-redux"
import style from '../../../style'



class Feed extends React.PureComponent {
    constructor() {
        super()
        this.state = {
            loading: true,
            rss: []
        }
    }


    filterHTML(desc) {
        const filteredDesc = desc.replace('<br/>', '').replace('<br />', '')
        return filteredDesc
    }

    onShare = async (message, url) => {
        try {
            const result = await Share.share({
                message,
                url
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    parseInfo(title) {
        let content = title.split('http')[0]
        let str = 'http' + title.split('http')[1]
        let link = str.split(' ')[0]
        if (link.includes('undefined')) link = ''

        return [content, link]
    }

    render() {
        // console.log("TWEETS", this.props.feed)

        const images = [
            require('../../../assets/images/stock/1.jpeg'),
            require('../../../assets/images/stock/2.jpg'),
            require('../../../assets/images/stock/3.jpg')
        ]

        return (

            <View style={{ flex: 1, paddingBottom: 75 }}>
                <View style={style.header}>
                    <Text style={style.h1}>News Feed</Text>
                    <Text style={style.h4}>Read the latest cyber threat news</Text>
                </View>

                {!this.props.loading ?
                    <View>
                        <FlatList
                            data={this.props.feed}
                            maxToRenderPerBatch={3}
                            renderItem={({ item, index }) =>
                                <View key={index} style={{ backgroundColor: '#1f243f' }}>
                                    {item.isTwitter ?
                                        <View>
                                            <View style={style.body}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Icon name='twitter' color='#1da1f2' size={25} />
                                                        <Text style={{ fontSize: 14 }}>  {item.handle}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => this.onShare(`Check out this tweet by ${item.handle}!\n\n${Platform.OS === 'android' ? item.links[0].url : ''}`, item.links[0].url)}>
                                                        <Image style={{ marginLeft: 5 }} source={require('../../../assets/images/share.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ maxWidth: '90%' }}>
                                                        <Text style={[style.h5, { color: '#fff', marginBottom: 10 }]}>{this.parseInfo(item.title)[0]}</Text>

                                                        <TouchableOpacity onPress={() => Linking.openURL(this.parseInfo(item.title)[1]).catch((err) => console.log('An error occurred opening the news feed link', err))}>
                                                            <Text style={[style.h5, { color: '#faf549', marginBottom: 5 }]}>{this.parseInfo(item.title)[1]}</Text>
                                                        </TouchableOpacity>

                                                        <Text style={style.h6}>{moment(item.published).fromNow()}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <Divider style={{ height: 16, backgroundColor: '#232947' }} />
                                        </View>

                                        :
                                        <View>
                                            <View style={[style.body, { marginRight: 10, flexDirection: 'row', justifyContent: 'space-between' }]}>
                                                <View style={{ maxWidth: '90%' }}>
                                                    <Text style={[style.h3, { flexWrap: 'wrap' }]}>{item.title}</Text>
                                                    <Text style={style.h6}>{moment(item.published).fromNow()}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => this.onShare(`Check out this article!\n\n${Platform.OS === 'android' ? item.links[0].url : ''}`, item.links[0].url)}>
                                                    <Image style={{ paddingLeft: 7 }} source={require('../../../assets/images/share.png')} />
                                                </TouchableOpacity>
                                            </View>

                                            <Image source={images[index % 3]} style={{ width: '100%', height: 200 }} />
                                            <View style={style.body}>
                                                {<HTMLView
                                                    value={this.filterHTML(item.description)}
                                                    addLineBreaks={false}
                                                    stylesheet={richTextStyles}
                                                />}
                                            </View>
                                            <Divider style={{ height: 16, backgroundColor: '#232947' }} />
                                        </View>}
                                </View>
                            }
                        />
                    </View>

                    : <View style={{ height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', textAlign: 'center' }}>
                        <ActivityIndicator animating={true} size="large" color="#fff" />
                    </View>
                }
            </View>
        )
    }
}

const richTextStyles = StyleSheet.create({
    p: {
        marginBottom: -20
    },
    ul: {
        marginTop: -20,
        marginBottom: -20
    },
    div: {
        marginTop: -20,
        marginBottom: -70
    }
})
const mapStateToProps = state => {

    return {
        feed: state.feed.tweets,

        loading: state.feed.loading
    }
}
export default connect(mapStateToProps, null)(Feed)