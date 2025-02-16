// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/DeepSearch.sol";

contract DeepSearchScript is Script {
    function run() external {
        // 从环境变量获取私钥字符串
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");

        // 添加0x前缀并解析
        string memory prefixedKey = string.concat("0x", privateKeyStr);
        uint256 deployerPrivateKey = vm.parseUint(prefixedKey);

        // 开始广播交易
        vm.startBroadcast(deployerPrivateKey);

        // 部署合约，设置初始查询费用为 0.001 ETH
        DeepSearch deepSearch = new DeepSearch(1000000000000000);

        // 停止广播
        vm.stopBroadcast();

        // 输出部署的合约地址
        console.log("DeepSearch deployed to:", address(deepSearch));
    }
}
