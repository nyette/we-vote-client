import withStyles from '@mui/styles/withStyles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
// import styled from 'styled-components';
import webAppConfig from '../../../config';
import AppObservableStore, { messageService } from '../../stores/AppObservableStore';
import ChallengeStore from '../../stores/ChallengeStore';
import ChallengeSupporterStore from '../../stores/ChallengeSupporterStore';
import historyPush from '../../utils/historyPush';
import keepHelpingDestination from '../../utils/keepHelpingDestination';
import { renderLog } from '../../utils/logging';
// import saveCampaignSupportAndGoToNextPage from '../../utils/saveCampaignSupportAndGoToNextPage';
import ChallengeCardForListBody from './ChallengeCardForListBody';

class ChallengeCardForList extends Component {
  constructor (props) {
    super(props);
    this.state = {
      challengeSupported: false,
      // challenge: {},
      inPrivateLabelMode: false,
      payToPromoteStepCompleted: false,
      payToPromoteStepTurnedOn: false,
      sharingStepCompleted: false,
      step2Completed: false,
    };
    this.functionToUseToKeepHelping = this.functionToUseToKeepHelping.bind(this);
    this.functionToUseWhenProfileComplete = this.functionToUseWhenProfileComplete.bind(this);
    this.getChallengeBasePath = this.getChallengeBasePath.bind(this);
    this.onChallengeClick = this.onChallengeClick.bind(this);
    this.onChallengeClickLink = this.onChallengeClickLink.bind(this);
    this.onChallengeEditClick = this.onChallengeEditClick.bind(this);
    this.onChallengeGetMinimumSupportersClick = this.onChallengeGetMinimumSupportersClick.bind(this);
    this.onChallengeShareClick = this.onChallengeShareClick.bind(this);
    this.pullChallengeSupporterVoterEntry = this.pullChallengeSupporterVoterEntry.bind(this);
  }

  componentDidMount () {
    // console.log('ChallengeCardForList componentDidMount');
    this.onAppObservableStoreChange();
    this.appStateSubscription = messageService.getMessage().subscribe(() => this.onAppObservableStoreChange());
    this.onChallengeStoreChange();
    this.challengeStoreListener = ChallengeStore.addListener(this.onChallengeStoreChange.bind(this));
    this.onChallengeSupporterStoreChange();
    this.challengeSupporterStoreListener = ChallengeSupporterStore.addListener(this.onChallengeSupporterStoreChange.bind(this));
  }

  componentDidUpdate (prevProps) {
    const {
      challengeWeVoteId: challengeWeVoteIdPrevious,
      voterWeVoteId: voterWeVoteIdPrevious,
    } = prevProps;
    const {
      challengeWeVoteId,
      voterWeVoteId,
    } = this.props;
    if (challengeWeVoteId || voterWeVoteId) {
      if ((challengeWeVoteId !== challengeWeVoteIdPrevious) ||
          (voterWeVoteId !== voterWeVoteIdPrevious)) {
        this.onChallengeStoreChange();
        this.onChallengeSupporterStoreChange();
      }
    }
  }

  componentWillUnmount () {
    this.appStateSubscription.unsubscribe();
    this.challengeStoreListener.remove();
    this.challengeSupporterStoreListener.remove();
  }

  onAppObservableStoreChange () {
    const { inPrivateLabelMode: inPrivateLabelModePrevious, payToPromoteStepTurnedOn: payToPromoteStepTurnedOnPrevious } = this.state;
    const inPrivateLabelMode = AppObservableStore.inPrivateLabelMode();
    const payToPromoteStepTurnedOn = !inPrivateLabelMode && webAppConfig.ENABLE_PAY_TO_PROMOTE;
    if (inPrivateLabelModePrevious !== inPrivateLabelMode) {
      this.setState({
        inPrivateLabelMode,
      });
    }
    if (payToPromoteStepTurnedOnPrevious !== payToPromoteStepTurnedOn) {
      this.setState({
        payToPromoteStepTurnedOn,
      });
    }
  }

  onChallengeStoreChange () {
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    // const voterCanEditThisChallenge = ChallengeStore.getVoterCanEditThisChallenge(challengeWeVoteId);
    this.setState({
      challenge,
      // voterCanEditThisChallenge,
    });
  }

  onChallengeSupporterStoreChange () {
    const {
      challengeWeVoteId,
    } = this.props;
    // console.log('ChallengeCardForList onChallengeSupporterStoreChange challengeWeVoteId:', challengeWeVoteId, ', challengeSEOFriendlyPath:', challengeSEOFriendlyPath);
    if (challengeWeVoteId) {
      this.pullChallengeSupporterVoterEntry(challengeWeVoteId);
    }
  }

  onChallengeClickLink () {
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    if (!challenge) {
      return null;
    }
    const {
      in_draft_mode: inDraftMode,
    } = challenge;
    if (inDraftMode) {
      return '/start-a-challenge-preview';
    } else {
      return `${this.getChallengeBasePath()}`;
    }
  }

  onChallengeClick () {
    AppObservableStore.setBlockChallengeRedirectOnSignIn(true);
    historyPush(this.onChallengeClickLink());
  }

  onChallengeEditClick () {
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    // console.log('challenge:', challenge);
    if (!challenge) {
      return null;
    }
    const {
      in_draft_mode: inDraftMode,
    } = challenge;
    if (inDraftMode) {
      historyPush('/start-a-challenge-preview');
    } else {
      historyPush(`${this.getChallengeBasePath()}edit`);
    }
    return null;
  }

  onChallengeGetMinimumSupportersClick () {
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    // console.log('challenge:', challenge);
    if (!challenge) {
      return null;
    }
    historyPush(`${this.getChallengeBasePath()}share-challenge`);
    return null;
  }

  onChallengeShareClick () {
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    // console.log('challenge:', challenge);
    if (!challenge) {
      return null;
    }
    historyPush(`${this.getChallengeBasePath()}share-challenge`);
    return null;
  }

  getChallengeBasePath () {
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    // console.log('challenge:', challenge);
    if (!challenge) {
      return null;
    }
    const {
      seo_friendly_path: challengeSEOFriendlyPath,
    } = challenge;
    let challengeBasePath;
    if (challengeSEOFriendlyPath) {
      challengeBasePath = `/c/${challengeSEOFriendlyPath}/`;
    } else {
      challengeBasePath = `/id/${challengeWeVoteId}/`;
    }
    return challengeBasePath;
  }

  pullChallengeSupporterVoterEntry (challengeWeVoteId) {
    if (challengeWeVoteId) {
      const challengeSupporterVoterEntry = ChallengeSupporterStore.getChallengeSupporterVoterEntry(challengeWeVoteId);
      // console.log('onChallengeSupporterStoreChange challengeSupporterVoterEntry:', challengeSupporterVoterEntry);
      const {
        challenge_supported: challengeSupported,
        challenge_we_vote_id: challengeWeVoteIdFromChallengeSupporter,
      } = challengeSupporterVoterEntry;
      // console.log('onChallengeSupporterStoreChange challengeSupported: ', challengeSupported);
      if (challengeWeVoteIdFromChallengeSupporter) {
        const step2Completed = ChallengeSupporterStore.voterSupporterEndorsementExists(challengeWeVoteId);
        const payToPromoteStepCompleted = ChallengeSupporterStore.voterChipInExists(challengeWeVoteId);
        const sharingStepCompleted = false;
        this.setState({
          challengeSupported,
          sharingStepCompleted,
          step2Completed,
          payToPromoteStepCompleted,
        });
      } else {
        this.setState({
          challengeSupported: false,
        });
      }
    }
  }

  functionToUseToKeepHelping () {
    const { payToPromoteStepCompleted, payToPromoteStepTurnedOn, sharingStepCompleted, step2Completed } = this.state;
    // console.log(payToPromoteStepCompleted, payToPromoteStepTurnedOn, sharingStepCompleted, step2Completed);
    const keepHelpingDestinationString = keepHelpingDestination(step2Completed, payToPromoteStepCompleted, payToPromoteStepTurnedOn, sharingStepCompleted);
    // console.log('functionToUseToKeepHelping keepHelpingDestinationString:', keepHelpingDestinationString);
    historyPush(`${this.getChallengeBasePath()}${keepHelpingDestinationString}`);
  }

  functionToUseWhenProfileComplete () {
    const { challengeWeVoteId } = this.props;
    if (challengeWeVoteId) {
      // const challengeBasePath = this.getChallengeBasePath();
      // saveChallengeSupportAndGoToNextPage(challengeWeVoteId, challengeBasePath);
    } else {
      console.log('ChallengeCardForList functionToUseWhenProfileComplete challengeWeVoteId not found');
    }
  }

  render () {
    renderLog('ChallengeCardForList');  // Set LOG_RENDER_EVENTS to log all renders
    const { limitCardWidth, useVerticalCard } = this.props;
    const { challengeSupported } = this.state; // , inPrivateLabelMode, voterCanEditThisChallenge
    const { challengeWeVoteId } = this.props;
    const challenge = ChallengeStore.getChallengeByWeVoteId(challengeWeVoteId);
    if (!challenge) {
      return null;
    }
    // console.log('ChallengeCardForList render, challenge:', challenge);
    const {
      // ballot_guide_official_statement: ballotGuideOfficialStatement, // Consider using this
      challenge_description: challengeDescription,
      challenge_title: challengeTitle,
      // final_election_date_as_integer: finalElectionDateAsInteger,
      // final_election_date_in_past: finalElectionDateInPast,
      in_draft_mode: inDraftMode,
      // is_blocked_by_we_vote: isBlockedByWeVote,
      // is_in_team_review_mode: isInTeamReviewMode,
      // is_supporters_count_minimum_exceeded: isSupportersCountMinimumExceeded,
      profile_image_background_color: profileImageBackgroundColor,
      supporters_count: supportersCount,
      supporters_count_next_goal: supportersCountNextGoal,
      // visible_on_this_site: visibleOnThisSite,
      we_vote_hosted_challenge_photo_large_url: challengePhotoLargeUrl,
      // we_vote_hosted_challenge_photo_medium_url: challengePhotoMediumUrl,
      // we_vote_hosted_profile_image_url_large: weVoteHostedProfileImageUrlLarge,
    } = challenge;
    // const stateName = convertStateCodeToStateText(stateCode);
    const supportersCountNextGoalWithFloor = supportersCountNextGoal || ChallengeStore.getChallengeSupportersCountNextGoalDefault();
    // const year = getYearFromUltimateElectionDate(finalElectionDateAsInteger);
    return (
      <ChallengeCardForListBody
        challengeDescription={challengeDescription}
        challengeSupported={challengeSupported}
        challengeTitle={challengeTitle}
        challengeWeVoteId={challengeWeVoteId}
        hideCardMargins
        inDraftMode={inDraftMode}
        functionToUseToKeepHelping={this.functionToUseToKeepHelping}
        functionToUseWhenProfileComplete={this.functionToUseWhenProfileComplete}
        limitCardWidth={limitCardWidth}
        onChallengeClick={this.onChallengeClick}
        onChallengeClickLink={this.onChallengeClickLink}
        photoLargeUrl={challengePhotoLargeUrl}
        profileImageBackgroundColor={profileImageBackgroundColor}
        supportersCount={supportersCount}
        supportersCountNextGoalWithFloor={supportersCountNextGoalWithFloor}
        tagIdBaseName=""
        useVerticalCard={useVerticalCard}
      />
    );
  }
}
ChallengeCardForList.propTypes = {
  challengeWeVoteId: PropTypes.string,
  voterWeVoteId: PropTypes.string,
  limitCardWidth: PropTypes.bool,
  useVerticalCard: PropTypes.bool,
};

const styles = (theme) => ({
  buttonRoot: {
    width: 250,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

// const ChallengeOwnersWrapper = styled('div')`
// `;

export default withStyles(styles)(ChallengeCardForList);