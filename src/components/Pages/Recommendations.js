import React from 'react'
import { Dimensions, Image, Linking, ScrollView, View } from 'react-native'
import { Divider, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import text from '../../text/Recommendations'
import style from '../../../style'


export default class Recommendations extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeSlide: 0,
            sliderWidth: Dimensions.get('window').width,
            loading: true
        }
    }

    componentDidMount() {
        const { navigation } = this.props;
        const activeSlide = navigation.getParam('critical', 0);

        console.log("Active Slide", activeSlide)
        this.setState({ activeSlide, loading: false }, () => console.log("HERE", this.state.activeSlide))
        // this.carouselRef.snapToNext()
    }


    renderItem({ item, index }) {
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', height: 91, marginVertical: 15, borderRadius: 5, backgroundColor: '#313961', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Text style={style.h3}>THREAT LEVEL</Text>
                    <Image style={{width: 79, height: 20}} source={item.src} />
                </View>

                <View>
                    <Text style={[style.h5, { fontStyle: 'italic', marginBottom: 5 }]}>Overview</Text>
                    <Text style={{ alignSelf: 'center' }}>{item.overview}</Text>
                </View>

                <Divider style={{ height: 2, marginVertical: 15, backgroundColor: '#737589' }} />

                <Text style={[style.h5, { fontStyle: 'italic', marginBottom: 5 }]}>Tips</Text>
                {item.tips.map((tip, tipIndex) => (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 34, margin: 10, marginLeft: 0, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name='asterisk' color='#fb4968' size={15} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ marginVertical: 5 }} onPress={() => ((tipIndex == item.tips.length - 1) && index == 1) && Linking.openURL('https://www.lacyberlab.org/stop-cyber-crime/').catch((err) => console.log('An error occurred', err))}>
                                    {tip}
                                    <Text style={{ color: '#faf549', textDecorationLine: 'underline' }}>{((tipIndex == item.tips.length - 1) && index == 1) && item.linkText[0]}</Text>
                                </Text>
                            </View>
                        </View>

                        {tipIndex != item.tips.length - 1 && <Divider style={{ height: 1, backgroundColor: '#737589' }} />}
                    </View>
                ))}

                <Divider style={{ height: 2, marginVertical: 15, backgroundColor: '#737589' }} />


                {item.proTips &&
                    <View>
                        <Text style={[style.h5, { fontStyle: 'italic', marginBottom: 5 }]}>* Pro-Tips</Text>
                        {item.proTips.map((tip, proTipIndex) => (
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 34, margin: 10, marginLeft: 0, justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon name='asterisk' color='#fb4968' size={15} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ marginVertical: 5 }} onPress={() => ((proTipIndex == item.proTips.length - 1) && index == 1) && Linking.openURL('https://www.lacyberlab.org/tools-for-la-businesses/').catch((err) => console.log('An error occurred', err))}>
                                            {tip}
                                            <Text style={{ color: '#faf549', textDecorationLine: 'underline' }}>{((proTipIndex == item.proTips.length - 1) && index == 1) && item.linkText[1]}</Text>
                                        </Text>
                                    </View>
                                </View>

                                {proTipIndex != item.proTips.length - 1 && <Divider style={{ height: 1, backgroundColor: '#737589' }} />}
                            </View>
                        ))}
                    </View>
                }

            </ScrollView>
        )
    }
    render() {
        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                {!this.state.loading &&
                    <View style={{flex: 1}}>
                        <Text style={[style.h3, { alignSelf: 'center' }]}>Recommendations</Text>

                        <View style={[style.body, { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 0 }]}>
                            <Carousel
                                ref={ref => this.carouselRef = ref}
                                data={text.recommendations}
                                renderItem={this.renderItem}
                                sliderWidth={this.state.sliderWidth}
                                initialNumToRender={this.state.activeSlide}
                                firstItem={this.state.activeSlide}
                                onSnapToItem={index => this.setState({ activeSlide: index })}
                                itemWidth={this.state.sliderWidth * .91}
                                removeClippedSubviews={false}
                            // inactiveSlideOpacity={0}
                            // inactiveSlideScale={0.75}
                            />
                            <Pagination
                                dotsLength={text.recommendations.length}
                                activeDotIndex={this.state.activeSlide}
                                dotStyle={{
                                    width: 7,
                                    // height: 7,
                                    borderRadius: 5,
                                    backgroundColor: '#fa4969'
                                }}
                                dotContainerStyle={{ marginHorizontal: 2 }}
                                tappableDots={!!this.carouselRef}
                                carouselRef={this.carouselRef}
                                inactiveDotStyle={{ backgroundColor: '#575a6f' }}
                                inactiveDotScale={1}
                                inactiveDotOpacity={1}
                            />
                        </View>
                    </View>
                }
            </View>

        )
    }
}