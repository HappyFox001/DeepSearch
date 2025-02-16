// SPDX-License-Identifier: UNLICENSED

// supoort service from DeepSearch to Base chain Agent
pragma solidity ^0.8.13;

contract DeepSearch {
    // 合约拥有者地址
    address public owner;

    // 查询费用
    uint256 public queryFee;

    // 查询结果结构体
    struct QueryResult {
        string question;
        string answer;
        uint256 timestamp;
        bool isProcessed;
    }

    // 存储查询结果的映射
    mapping(uint256 => QueryResult) public queries;
    uint256 public nextQueryId;

    // 事件声明
    event NewQuery(
        uint256 indexed queryId,
        address indexed requester,
        string question
    );
    event QueryAnswered(uint256 indexed queryId, string answer);

    // 构造函数
    constructor(uint256 _queryFee) {
        owner = msg.sender;
        queryFee = _queryFee;
        nextQueryId = 1;
    }

    // 修饰符：只有合约拥有者可以调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // 发起查询
    function submitQuery(
        string memory _question
    ) public payable returns (uint256) {
        require(msg.value >= queryFee, "Insufficient payment");

        uint256 queryId = nextQueryId++;

        queries[queryId] = QueryResult({
            question: _question,
            answer: "",
            timestamp: block.timestamp,
            isProcessed: false
        });

        emit NewQuery(queryId, msg.sender, _question);

        return queryId;
    }

    function updateQueryResult(
        uint256 _queryId,
        string memory _answer
    ) public onlyOwner {
        require(_queryId < nextQueryId, "Query does not exist");
        require(!queries[_queryId].isProcessed, "Query already processed");

        queries[_queryId].answer = _answer;
        queries[_queryId].isProcessed = true;

        emit QueryAnswered(_queryId, _answer);
    }

    // 获取查询结果
    function getQueryResult(
        uint256 _queryId
    )
        public
        view
        returns (
            string memory question,
            string memory answer,
            uint256 timestamp,
            bool isProcessed
        )
    {
        require(_queryId < nextQueryId, "Query does not exist");
        QueryResult memory result = queries[_queryId];
        return (
            result.question,
            result.answer,
            result.timestamp,
            result.isProcessed
        );
    }

    // 更新查询费用（只有合约拥有者可以调用）
    function updateQueryFee(uint256 _newFee) public onlyOwner {
        queryFee = _newFee;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
