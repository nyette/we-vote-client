import withStyles from '@mui/styles/withStyles';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import VoterActions from '../../actions/VoterActions';
import { renderLog } from '../../common/utils/logging';
import VoterStore from '../../stores/VoterStore';
import {
  InputFieldsWrapper,
  SetUpAccountIntroText,
  SetUpAccountTitle,
  SetUpAccountTop,
  StepCenteredWrapper,
  VoterNameWrapper,
} from '../Style/SetUpAccountStyles';

const VoterPhotoUpload = React.lazy(() => import(/* webpackChunkName: 'VoterPhotoUpload' */ '../../common/components/Settings/VoterPhotoUpload'));

class SetUpAccountAddPhoto extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      voterFirstName: '',
      voterLastName: '',
      voterPhotoMissing: false,
    };
  }

  componentDidMount () {
    window.scrollTo(0, 0);
    this.onVoterStoreChange();
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentDidUpdate (prevProps) {
    // console.log('SetUpAccountAddPhoto componentDidUpdate prevProps.nextButtonClicked:', prevProps.nextButtonClicked, ', this.props.nextButtonClicked:', this.props.nextButtonClicked);
    if (prevProps.nextButtonClicked === false && this.props.nextButtonClicked === true) {
      this.submitSavePhoto();
    }
  }

  componentWillUnmount () {
    this.voterStoreListener.remove();
    if (this.functionToUseWhenProfileCompleteTimer) {
      clearTimeout(this.functionToUseWhenProfileCompleteTimer);
    }
    if (this.goToNextStepTimer) {
      clearTimeout(this.goToNextStepTimer);
    }
  }

  onVoterStoreChange () {
    const voterFirstName = VoterStore.getFirstName();
    const voterLastName = VoterStore.getLastName();
    const voterProfileUploadedImageUrlLarge = VoterStore.getVoterProfileUploadedImageUrlLarge();
    this.setState({
      voterFirstName,
      voterLastName,
      voterProfileUploadedImageUrlLarge,
    });
  }

  functionToUseWhenProfileCompleteLocal = () => {
    if (this.props.functionToUseWhenProfileComplete) {
      this.props.functionToUseWhenProfileComplete();
    }
  }

  functionToUseWhenProfileNotCompleteLocal = () => {
    if (this.props.functionToUseWhenProfileNotComplete) {
      this.props.functionToUseWhenProfileNotComplete();
    }
  }

  goToNextStepLocal = () => {
    if (this.props.goToNextStep) {
      this.props.goToNextStep();
    }
  }

  submitSavePhoto = () => {
    // console.log('SetUpAccountAddPhoto submitSavePhoto');
    let voterPhotoMissing = false;
    const voterPhotoQueuedToSave = VoterStore.getVoterPhotoQueuedToSave();
    const voterPhotoQueuedToSaveSet = VoterStore.getVoterPhotoQueuedToSaveSet();
    VoterActions.voterCompleteYourProfileSave(null, false, null, false, voterPhotoQueuedToSave, voterPhotoQueuedToSaveSet);
    VoterActions.voterFirstNameQueuedToSave(undefined);
    VoterActions.voterLastNameQueuedToSave(undefined);
    VoterActions.voterPhotoQueuedToSave(undefined);
    VoterActions.voterPhotoTooBigReset();

    if (!voterPhotoQueuedToSave && !VoterStore.getVoterProfileUploadedImageUrlLarge()) {
      voterPhotoMissing = true;
    }
    if (voterPhotoMissing) {
      this.setState({
        voterPhotoMissing,
      }, () => this.functionToUseWhenProfileNotCompleteLocal());
    } else {
      VoterActions.voterRetrieve();
      this.functionToUseWhenProfileCompleteTimer = setTimeout(() => {
        this.functionToUseWhenProfileCompleteLocal();
      }, 500);
      this.goToNextStepTimer = setTimeout(() => {
        this.goToNextStepLocal();
      }, 500);
    }
  }

  render () {
    renderLog('SetUpAccountAddPhoto');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      voterFirstName, voterLastName, voterPhotoMissing, voterProfileUploadedImageUrlLarge,
    } = this.state;

    return (
      <StepCenteredWrapper>
        {voterProfileUploadedImageUrlLarge ? (
          <SetUpAccountTop>
            <SetUpAccountTitle>Looking good!</SetUpAccountTitle>
          </SetUpAccountTop>
        ) : (
          <SetUpAccountTop>
            <SetUpAccountTitle>Add your photo</SetUpAccountTitle>
            <SetUpAccountIntroText>Profile pictures help your friends find you.</SetUpAccountIntroText>
          </SetUpAccountTop>
        )}
        <InputFieldsWrapper>
          {voterPhotoMissing && (
            <VoterPhotoMissing>
              Please upload a photo, or click `Skip for now`.
            </VoterPhotoMissing>
          )}
          <VoterPhotoOuterWrapper>
            <Suspense fallback={<></>}>
              <VoterPhotoUpload showLabel />
            </Suspense>
          </VoterPhotoOuterWrapper>
        </InputFieldsWrapper>
        <VoterNameWrapper>
          {voterFirstName}
          {' '}
          {voterLastName}
        </VoterNameWrapper>
      </StepCenteredWrapper>
    );
  }
}
SetUpAccountAddPhoto.propTypes = {
  functionToUseWhenProfileComplete: PropTypes.func,
  functionToUseWhenProfileNotComplete: PropTypes.func,
  goToNextStep: PropTypes.func,
  nextButtonClicked: PropTypes.bool,
};

const styles = () => ({
});

const VoterPhotoMissing = styled('div')`
  font-size: 18px;
  color: red;
`;

const VoterPhotoOuterWrapper = styled('div')`
  height: 240px;
`;

export default withStyles(styles)(SetUpAccountAddPhoto);
