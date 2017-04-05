import { Meteor } from 'meteor/meteor';
import trackerReact from 'meteor/ultimatejs:tracker-react';
import { UserFamily } from '../../../api/collections/UserFamily.js';
import { FoodOpenData } from '../../../api/collections/FoodOpenData.js';

import React from 'react';
import Title from 'react-title-component';
import StepBar from './components/StepBar.jsx';
import MealRecordManualPanel from './components/MealRecordManualPanel.jsx';

import { connect } from 'react-redux';
import { setPageTitle } from '../../../redux/actions/setPageTitle.js';
import Modal from 'react-modal';

import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import SearchIcon from 'material-ui/svg-icons/action/search';

import TextField from 'material-ui/TextField';
import ToggleDisplay from 'react-toggle-display';
import IconButton from 'material-ui/IconButton';
import IconContentClear from 'material-ui/svg-icons/content/clear';
import IconOff from 'material-ui/svg-icons/navigation/close';
import FoodList from '../../components/FoodList.jsx';
import { orange500 } from 'material-ui/styles/colors';

import Loader from 'react-loader';

const pageTitle = '24시간 식사기록(간편입력)';
const modalStyle = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    position: 'absolute',
    top: '70px',
    left: '20px',
    right: '20px',
    bottom: '20px',
    border: '1px solid #ccc',
    // background: '#fff',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',

  },
};
const styles = {
  icon: {
    tiny: {
      width: 12,
      height: 12,
    },
    small: {
      width: 16,
      height: 16,
    },
  },
  button: {
    tiny: {
      width: 16,
      height: 16,
      padding: 0,
      marginLeft: '-20px',
    },
    small: {
      width: 32,
      height: 32,
    },
  },
};

const loaderOptions = {
  lines: 13,
  length: 20,
  width: 10,
  radius: 30,
  scale: 1.00,
  corners: 1,
  color: '#000',
  opacity: 0.25,
  rotate: 0,
  direction: 1,
  speed: 1,
  trail: 60,
  fps: 20,
  zIndex: 2e9,
  top: '50%',
  left: '50%',
  shadow: false,
  hwaccel: false,
  position: 'absolute',
};

class MrdInputManualPage extends trackerReact(React.Component) {
  constructor(props) {
    super(props);
    this.familyId = this.props.params.familyId;
    this.userId = this.props.user ? this.props.user._id : null;
    // console.log('this.props.user', this.props.user);
    this.state = {
      loaded: true,
      openFoodDialog: false,
      foodNameClear: false,
      foodOpenData: [],
      subscription: {
        userFamilies: Meteor.subscribe('userfamilies.private'),
        /*
        foodOpenData: Meteor.subscribe('food_open_data.all', {
          onReady() { console.log('onReady!'); this.setState({ loaded: true }); },
        }),
        */
        // mediaFiles: Meteor.subscribe('MediaFiles.all'),
      },
    };
    this.openFoodDialog = this.openFoodDialog.bind(this);
    // this.foodOpenDataByName = this.foodOpenDataByName.bind(this);
    this.onSearchFoodName = this.onSearchFoodName.bind(this);
    this.onTextClear = this.onTextClear.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(setPageTitle(pageTitle));
  }
  componentDidMount() {
    // console.log('componentDidMount');
  }
  componentWillUnmount() {
    this.state.subscription.userFamilies.stop();
    // this.state.subscription.foodOpenData.stop();
    // this.state.subscription.mediaFiles.stop();
    // console.log('MrdInputManualPage', 'componentWillUnmount');
  }
  userFamily(familyId) {
    return UserFamily.findOne({ _id: familyId });
  }
  openFoodDialog() {
    this.setState({
      openFoodDialog: true,
    });
  }
  onSearchFoodName() {
    const searchText = document.getElementById('searchText').value;
    // searchText = searchText.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'); // query.search;
    // console.log('foodOpenData.ready', this.state.subscription.foodOpenData.ready());
    /*
    const find = (searchText === '') ? {} : { DESC_KOR: { $regex: `${searchText}` } };
    const foodList = FoodOpenData.find(find, {
      sort: { NUM: 1 },
    }).fetch();
    */
    Meteor.call('fooddata.getByName', searchText, (err, res) => {
      this.setState({
        foodOpenData: res,
      });
    });
    /*
    this.setState({
      foodOpenData: foodList,
    });
    */
  }
  onTextChange(e, searchText) {
    if (searchText !== '') {
      this.setState({ foodNameClear: true });
    } else {
      this.setState({ foodNameClear: false });
    }
    // console.log('foodNameClear', this.state.foodNameClear);
  }
  onTextClear() {
    // this.refs.searchText.value = '';
    document.getElementById('searchText').value = '';
    this.setState({
      foodOpenData: [],
      foodNameClear: false,
      searchText: '',
    });
  }
  handleClose = () => {
    this.setState({ openFoodDialog: false });
    this.onTextClear();
  };
  render() {
    const mealRecords = [
      { title: '아침', mealType: 'breakFast' },
      { title: '간식', mealType: 'snack_1' },
      { title: '점심', mealType: 'lunch' },
      { title: '간식', mealType: 'snack_2' },
      { title: '저녁', mealType: 'dinner' },
      { title: '간식', mealType: 'snack_3' },
    ];
    return (
      <div className="root counsel-step-content content-center bg-gray">
        <Title render={(previousTitle) => `${pageTitle} - ${previousTitle}`} />
        <StepBar stepIndex={2} />
        <Loader loaded={this.state.loaded} options={loaderOptions} className="spinner" />
        <table>
          <tbody>
            <tr>
              <td>
                <img
                  src="/img/counselor.png"
                  alt="counselor"
                  style={{ verticalAlign: 'middle', width: '50px' }}
                />
              </td>
              <td>
                <h4 className="description content-left">
                  간편 검색 혹은 음식 사진을 통하여 식사기록을 제출하여<br />
                  식생활에 대한 리포트를 빠르게 받을 수 있는 서비스입니다.
                </h4>
              </td>
            </tr>
          </tbody>
        </table>
        {mealRecords.map((meal, idx) => (
          <MealRecordManualPanel
            key={idx}
            title={meal.title}
            mealType={meal.mealType}
            userId={this.userId}
            familyId={this.familyId}
            onAddButtonClick={this.openFoodDialog}
          />
        ))}
        <Modal
          className="modal-food-list"
          isOpen={this.state.openFoodDialog}
          // onAfterOpen={afterOpenFn}
          onRequestClose={this.handleClose}
          closeTimeoutMS={2}
          style={modalStyle}
          contentLabel="Food Search"
        >
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '10px' }}>Food Data Test</h3>
            <IconButton
              tooltip="Close Window" onTouchTap={this.handleClose}
              iconStyle={{ width: 30, height: 30 }}
              style={{
                position: 'absolute', display: 'inline-block',
                fontWeight: 'bold', top: '10px', right: '10px' }}
            >
              <IconOff color="#000" />
            </IconButton>
            <TextField
              ref="searchText"
              id="searchText"
              floatingLabelText="음식 이름"
              onKeyPress={(key) => { if (key.charCode === 13) this.onSearchFoodName(); }}
              floatingLabelStyle={{ color: orange500 }}
              // onChange={this.onTextChange}
              // onTextClear={this.onTextClear}
            />
            <ToggleDisplay show={this.state.foodNameClear}>
              <IconButton
                iconStyle={styles.icon.tiny}
                style={styles.button.tiny}
                onClick={this.onTextClear}
              >
                <IconContentClear />
              </IconButton>
            </ToggleDisplay>
            <Chip
              style={{ display: 'inline' }}
              onTouchTap={this.onSearchFoodName}
            >
              <Avatar icon={<SearchIcon />} />
              {this.state.foodOpenData.length.toLocaleString()}
            </Chip>
            <FoodList fooddata={this.state.foodOpenData} />
          </div>
        </Modal>
      </div>
    );
  }
}

MrdInputManualPage.propTypes = {
  dispatch: React.PropTypes.func,
  user: React.PropTypes.object,
  params: React.PropTypes.object,
};

function mapStateToProps(state) {
  return {
    user: state.authenticate.user,
  };
}

// export default connect(mapStateToProps)(MrdInputManualPage);
export default connect(mapStateToProps)(MrdInputManualPage);

