pragma solidity >= 0.8.2 <0.9.0;

contract test{

	string userInput;

	function set(string memory finalValue) public
	{
		userInput = finalValue;
	}

	function get() public view returns(string memory){
		return userInput;
	}
	
}
