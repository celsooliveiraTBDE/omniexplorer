/**
 *
 * Blocks
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routeActions } from 'redux-simple-router';
import { Link, withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Container } from 'reactstrap';
import styled from 'styled-components';
import ListHeader from 'components/ListHeader';
import BlockList from 'components/BlockList';
import LoadingIndicator from 'components/LoadingIndicator';
import JumpToBlock from 'components/JumpToBlock';

import injectSaga from 'utils/injectSaga';
import sagaBlocks from 'containers/Blocks/saga';

import { makeSelectBlocks, makeSelectLoading, makeSelectPreviousBlock } from './selectors';
import { loadBlocks } from './actions';
import messages from './messages';

export class Blocks extends React.Component {
  componentDidMount() {
    this.props.loadBlocks();
    console.log('Blocks did mount');
  }

  render() {
    const StyledContainer = styled(Container)`
      background-color: #f0f3f4;
      overflow: auto;
    `;
    const StyledH3 = styled.h3`
      padding: 3rem 0;
    `;

    let content;
    const hasBlocks = () => (this.props.blocks.blocks || []).length === 0;
    if (this.props.loading && !this.props.previousBlock) {
      content = <LoadingIndicator />;
    } else if (hasBlocks()) {
      content = (
        <StyledH3 className="lead text-center">
          <p className="h3">No Omni Protocol blocks found</p>
          <p className="h5">
            If the block you are searching for was just broadcast it might take
            a few minutes for the network to pass it around for us to see it.
          </p>
          <p className="h5">
            If the block you are searching for is a Bitcoin only block you
            should use a bitcoin block explorer like{' '}
            <a href="https://www.blocktrail.com">blocktrail.com</a>
          </p>
        </StyledH3>
      );
    } else {
      const { blocks } = this.props.blocks;
      content = (
        <div>
        <BlockList blocks={blocks} onSetBlockPage={this.props.onSetBlockPage}/>
        {this.props.previousBlock && this.props.loading &&
          <LoadingIndicator />
        }
        </div>
      );
    }

    const Footer = this.props.footer || <div/>;
    return (
      <StyledContainer fluid>
        <ListHeader totalLabel="Blocks" messages={messages}>
          <JumpToBlock />
        </ListHeader>
        {content}
        {Footer}
      </StyledContainer>
    );
  }
}

Blocks.propTypes = {
  blocks: PropTypes.object.isRequired,
  loadBlocks: PropTypes.func,
  onSetBlockPage: PropTypes.func,
  loading: PropTypes.bool,
  previousBlock: PropTypes.any,
  match: PropTypes.object,
  changeRoute: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  blocks: makeSelectBlocks(),
  loading: makeSelectLoading(),
  previousBlock: makeSelectPreviousBlock(),
  location: state => state.get('route').get('location'),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    loadBlocks: () => dispatch(loadBlocks()),
    changeRoute: url => dispatch(routeActions.push(url)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withSagaBlock = injectSaga({
  key: 'blocks',
  saga: sagaBlocks,
});

export default compose(
  withConnect,
  withSagaBlock,
  withRouter,
)(Blocks);