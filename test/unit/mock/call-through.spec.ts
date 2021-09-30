import { MockContract, MockContractFactory, smock } from '@src';
import { Counter, Counter__factory, Dai, Dai__factory } from '@typechained';
import chai, { expect } from 'chai';
import { waffle, ethers } from 'hardhat';
import CounterABI from '../../../artifacts/test/contracts/mock/Counter.sol/Counter.json';

chai.should();
chai.use(smock.matchers);

describe('Mock: Call through', () => {
  let counterFactory: MockContractFactory<Counter__factory>;
  let mock: MockContract<Counter>;

  before(async () => {
    counterFactory = await smock.mock('Counter');
  });

  beforeEach(async () => {
    mock = await counterFactory.deploy(1);
  });

  it('should call getters', async () => {
    expect(await mock.count()).to.equal(1);
  });

  it('should call methods', async () => {
    await mock.add(10);
    expect(await mock.count()).to.equal(11);
  });

  it('should be able to override returns', async () => {
    mock.count.returns(123);
    expect(await mock.count()).to.equal(123);
  });

  it('should be able to check function calls', async () => {
    await mock.add(10);
    expect(mock.add).to.be.calledOnceWith(10);
  });

});

describe('waffle deploy v.s. ethers deploy', () => {
  let counter: Counter;
  let daiFactory: MockContractFactory<Dai__factory>;
  let daiMock: MockContract<Dai>;
  let [alice] = waffle.provider.getWallets();

  before(async () => {
    daiFactory = await smock.mock('Dai');
  })

  describe('deploy using waffle', () => {
    beforeEach(async () => {
      counter = (await waffle.deployContract(alice, CounterABI, [1])) as Counter;
      daiMock = await daiFactory.deploy();

      await counter.setDaiAddress(daiMock.address);
    })

    it('should have correct call count', async () => {
      const amount = 5;
      expect(daiMock.transferFrom).to.have.callCount(0);

      await daiMock.setVariable('_balances', {
        [alice.address]: amount,
      });
      await daiMock.setVariable('_allowances', {
        [alice.address]: {
          [counter.address]: amount,
        },
      });

      await expect(counter.payDaiToAdd(amount)).to.not.be.reverted;
      // FIXME: the callCount is 12 !! Whaaaat?
      expect(daiMock.transferFrom).to.have.callCount(1);
    })
  })

  describe('deploy using ethers', () => {
    beforeEach(async () => {
      const counterFactory = await ethers.getContractFactory('Counter');
      counter = await counterFactory.deploy(1);
      daiMock = await daiFactory.deploy();

      await counter.setDaiAddress(daiMock.address);
    })
    it('should have correct call count', async () => {
      const amount = 5;
      expect(daiMock.transferFrom).to.have.callCount(0);

      await daiMock.setVariable('_balances', {
        [alice.address]: amount,
      });
      await daiMock.setVariable('_allowances', {
        [alice.address]: {
          [counter.address]: amount,
        },
      });

      await expect(counter.payDaiToAdd(amount)).to.not.be.reverted;
      // NOTE: correctly counted
      expect(daiMock.transferFrom).to.have.callCount(1);
    })
  })
})
