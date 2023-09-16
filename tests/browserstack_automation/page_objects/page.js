import { driver, $ } from '@wdio/globals';
import { VOTER_DEVICE_ID as voterDeviceId } from '../config/browserstack.config';

export default class Page {
  constructor () {
    this.title = '';
  }

  get header () {
    return $('#header-container');
  }

  get avatar () {
    return $('#profileAvatarHeaderBar');
  }

  get footer () {
    return $('#footer');
  }

  get isCordova () {
    return driver.isMobile;
  }

  get isAndroid () {
    return driver.isAndroid;
  }

  get isIOS () {
    return driver.isIOS;
  }

  async open (path) {
    await driver.url(path);
  }

  async getVoterDeviceId () {
    const cookie = await driver.getCookies('voter_device_id');
    if (cookie) {
      const [{ value }] = cookie;
      return value;
    }
    return null;
  }

  async signIn () {
    if (voterDeviceId) {
      const path = await driver.getUrl();
      const query = `?cid=${voterDeviceId}`;
      await this.open(path + query);
    }
  }
}
