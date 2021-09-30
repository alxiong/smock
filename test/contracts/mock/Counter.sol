// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Counter {
  address public deployer;
  uint256 public count;

  IERC20 private _dai;

  constructor(uint256 _startAt) {
    count = _startAt;
    deployer = msg.sender;
  }

  function add(uint256 _amount) external {
    count += _amount;
  }

  function setDaiAddress(address _daiAddress) external {
    _dai = IERC20(_daiAddress);
  }

  function payDaiToAdd(uint256 _amount) external {
    count += _amount;
    console.log('from contract: calling transferFrom');
    _dai.transferFrom(msg.sender, address(this), _amount);
    console.log('from contract: finish transferFrom');
  }
}

contract Dai is ERC20('Dai Stablecoin', 'DAI') {}
