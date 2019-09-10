import React from 'react'
import { Dimensions, Image, ScrollView, View } from 'react-native'
import { Divider, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Octicons'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import text from '../../text/Recommendations'
import style from '../../../style'


export default class Recommendations extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeSlide: 0,
            sliderWidth: Dimensions.get('window').width
        }
    }
componentDidMount=()=>{
    const { navigation } = this.props;
    const activeSlide = navigation.getParam('critical', 0);
    this.setState({activeSlide})
    this.carouselRef.snapToNext()

}
    renderItem({ item, index }) {
        return (

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', height: 91, marginVertical: 15, borderRadius: 5, backgroundColor: '#313961', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Text style={style.h3}>THREAT LEVEL</Text>
                    <Image source={item.src} />
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
                                <Icon name='primitive-dot' color='#fff' size={25} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text>{tip}</Text>
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
                                        <Icon name='primitive-dot' color='#fff' size={25} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text>{tip}</Text>
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
        const { navigation } = this.props;
        const activeSlide = navigation.getParam('critical', 0);
        // this.carouselRef.scrollToOffset(activeSlide*this.state.sliderWidth)
        return (
            <View style={[style.body, { flex: 1, justifyContent: 'center' }]}>
                <Text style={[style.h3, { alignSelf: 'center' }]}>Recommendations</Text>

                <View style={[style.body, { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 0 }]}>
                    <Carousel
                        ref={ref => this.carouselRef = ref}
                        data={text.recommendations}
                        renderItem={this.renderItem}
                        sliderWidth={this.state.sliderWidth}
                        // initialScrollIndex={activeSlide}
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

        )
    }
}