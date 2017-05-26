import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  Dimensions,
  Platform,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { filter, some, includes } from 'lodash/collection';
import { debounce } from 'lodash/function';

const INITIAL_TOP = Platform.OS === 'ios' ? -80 : -60;

export default class Search extends Component {

  static propTypes = {
    data: PropTypes.array,
    placeholder: PropTypes.string,
    handleChangeText: PropTypes.func,
    handleSearch: PropTypes.func,
    handleResults: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    onFocus: PropTypes.func,
    onHide: PropTypes.func,
    onBack: PropTypes.func,
    onX: PropTypes.func,
    backButton: PropTypes.object,
    backButtonAccessibilityLabel: PropTypes.string,
    closeButton: PropTypes.object,
    closeButtonAccessibilityLabel: PropTypes.string,
    backCloseSize: PropTypes.number,
    fontSize: PropTypes.number,
    heightAdjust: PropTypes.number,
    backgroundColor: PropTypes.string,
    iconColor: PropTypes.string,
    textColor: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    animate: PropTypes.bool,
    animationDuration: PropTypes.number,
    showOnLoad: PropTypes.bool,
    hideBack: PropTypes.bool,
    hideX: PropTypes.bool,
    iOSPadding: PropTypes.bool,
    iOSHideShadow: PropTypes.bool,
    clearOnShow: PropTypes.bool,
    clearOnHide: PropTypes.bool,
    focusOnLayout: PropTypes.bool,
    autoCorrect: PropTypes.bool,
    autoCapitalize: PropTypes.string,
    fontFamily: PropTypes.string,
    allDataOnEmptySearch: PropTypes.bool,
  }

  static defaultProps = {
    data: [],
    placeholder: 'Search',
    backButtonAccessibilityLabel: 'Navigate up',
    closeButtonAccessibilityLabel: 'Clear search text',
    heightAdjust: 0,
    backgroundColor: 'white',
    iconColor: 'gray',
    textColor: 'gray',
    placeholderTextColor: 'lightgray',
    animate: true,
    animationDuration: 200,
    showOnLoad: false,
    hideBack: false,
    hideX: false,
    iOSPadding: true,
    iOSHideShadow: false,
    clearOnShow: false,
    clearOnHide: true,
    focusOnLayout: true,
    autoCorrect: true,
    autoCapitalize: 'sentences',
    fontFamily: 'System',
    allDataOnEmptySearch: false,
    backCloseSize: 28,
    fontSize: 20
  }

  constructor(props) {
    super(props);
    this.state = {
      input: '',
      hideBack: true,
      show: props.showOnLoad,
      top: new Animated.Value(props.showOnLoad ? 0 : INITIAL_TOP + props.heightAdjust),
    };
  }

  getValue = () => {
    return this.state.input;
  }

  show = () => {
    const { animate, animationDuration, clearOnShow } = this.props;
    if (clearOnShow) {
      this.setState({ input: '' });
    }
    this.setState({ show: true });
    if (animate) {
      Animated.timing(
        this.state.top, {
            toValue: 0,
            duration: animationDuration,
        }
      ).start();
    } else {
      this.setState({ top: new Animated.Value(0) });
    }
  }

  hide = () => {
    const { onHide, animate, animationDuration } = this.props;
    if (onHide) {
      onHide(this.state.input);
    }
    if (animate) {
      Animated.timing(
        this.state.top, {
            toValue: INITIAL_TOP,
            duration: animationDuration,
        }
      ).start();
      setTimeout(() => {
        this._doHide();
      }, animationDuration);
    } else {
      this.setState({ top: new Animated.Value(INITIAL_TOP) })
      this._doHide()
    }
  }

  _doHide = () => {
    const { clearOnHide } = this.props;
    this.setState({ show: false });
    if (clearOnHide) {
      this.setState({ input: '' });
    }
  }

  _handleX = () => {
    const { onX } = this.props;
    this._clearInput()
    if (onX) onX()
  }

  _clearInput = () => {
    this.setState({ input: '' });
    this._onChangeText('');
  }

  _onChangeText = (input) => {
    const { handleChangeText, handleSearch, handleResults } = this.props;
    this.setState({ input });
    if (handleChangeText) {
      handleChangeText(input);
    }
    if (handleSearch) {
      handleSearch(input);
    } else {
      debounce(() => {
        // use internal search logic (depth first)!
        if (handleResults) {
          const results = this._internalSearch(input);
          handleResults(results);
        }
      }, 500)();
    }
  }

  _internalSearch = (input) => {
    const { data, allDataOnEmptySearch } = this.props;
    if (input === '') {
      return allDataOnEmptySearch ? data : [];
    }
    return filter(data, (item) => {
      return this._depthFirstSearch(item, input);
    });
  }

  _depthFirstSearch = (collection, input) => {
    // let's get recursive boi
    let type = typeof collection;
    // base case(s)
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return includes(collection.toString().toLowerCase(), input.toString().toLowerCase());
    }
    return some(collection, (item) => this._depthFirstSearch(item, input));
  }

    _onFocus = () => {
      const { onFocus } = this.props
      this.setState({hideBack: false})
      onFocus()
    }
    
    _onBack = () => {
      const { onBack } = this.props
      this.setState({hideBack: true})
      onBack()
    }
    
  render = () => {
    const {
      placeholder,
      heightAdjust,
      backgroundColor,
      iconColor,
      textColor,
      placeholderTextColor,
      onBack,
      hideBack,
      hideX,
      iOSPadding,
      iOSHideShadow,
      onSubmitEditing,
      onFocus,
      focusOnLayout,
      autoCorrect,
      autoCapitalize,
      fontFamily,
      backButton,
      backButtonAccessibilityLabel,
      closeButton,
      closeButtonAccessibilityLabel,
      backCloseSize,
        fontSize
    } = this.props;
    
    return (
     
          <View style={[
              styles.nav,
              { height: 45 },
            ]}
          >
          {
            !this.state.hideBack &&
            <TouchableOpacity
              accessible={true}
              accessibilityComponentType="button"
              accessibilityLabel={backButtonAccessibilityLabel}
              onPress={ this._onBack || this.hide}>
              {
              backButton ?
              <View style={{width: backCloseSize, height: backCloseSize}} >{backButton}</View>
              :
              <Icon
                name='arrow-back'
                size={backCloseSize}
                style={{
                  color: iconColor,
                  padding: heightAdjust / 2 + 10
                }}
              />
              }
            </TouchableOpacity>
          }
            <TextInput
              ref={(ref) => this.textInput = ref}
              onLayout={() => focusOnLayout && this.textInput.focus()}
              style={[
                styles.input,
                {
                  fontSize: fontSize, color: textColor, fontFamily: fontFamily,
                  marginLeft: this.state.hideBack ? 30: 0,
                }
              ]}
              onChangeText={(input) => this._onChangeText(input)}
              onSubmitEditing={() => onSubmitEditing ? onSubmitEditing() : null}
              onFocus={() => this._onFocus()}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              value={this.state.input}
              underlineColorAndroid='transparent'
              returnKeyType='search'
              autoCorrect={autoCorrect}
              autoCapitalize={autoCapitalize}
            />
            <TouchableOpacity
              accessible={true}
              accessibilityComponentType='button'
              accessibilityLabel={closeButtonAccessibilityLabel}
              onPress={hideX || this.state.input === '' ? null : this._handleX}>
              {
              closeButton ?
              <View style={{width: backCloseSize, height: backCloseSize}} >{closeButton}</View>
              :
              <Icon
                name={'close'}
                size={backCloseSize}
                style={{
                  color: hideX || this.state.input == '' ? backgroundColor : iconColor,
                  padding: heightAdjust / 2 + 10
                }}
              />
              }
            </TouchableOpacity>
          </View>
    );
  }
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: 'rgb(200, 199, 204)',
    borderWidth: 1,
    margin: 10
  },
  input: {
    flex: 1,
    fontWeight: 'normal',
    color: '#212121',
    backgroundColor: 'white',
  }
});
