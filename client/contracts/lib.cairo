  ```rust 
use starknet::ContractAddress; 

#[starknet::interface ]
trait IContract<T ContractState> {
    fn initialize(ref  self: TContractState, owner : ContractAddress);
    fn set_ admin(ref self: TContractState, new _admin: ContractAddress);
    fn  get_admin(self: @T ContractState) -> ContractAddress; 
}

#[starknet::contract ]
mod contract {
    use super:: ContractAddress;
    use starknet: :{get_caller_address, contract_address_ const};

    #[event]
    # [derive(Drop, starknet::Event )]
    enum Event {
        AdminChange d: AdminChanged,
        Initialized: Initialized, 
    }

    #[derive(Drop, stark net::Event)]
    struct AdminChanged {
        previous _admin: ContractAddress,
        new _admin: ContractAddress,
    } 

    #[derive(Drop, stark net::Event)]
    struct Initialized { 
        admin: ContractAddress
    }

    # [storage]
    struct Storage {
        initialize d: bool,
        admin: ContractAddress ,
    }

    #[constructor] 
    fn constructor(ref self : ContractState) {
        self .initialized.write(false);
        self. admin.write(contract_address_const: :<0>());
    }

    #[generate _trait]
    impl Internal  of InternalTrait {
        fn  assert_only_admin(self:  @ContractState) {
            let caller = get _caller_address();
            assert(caller == self. admin.read(), 'Caller is not admin ');
        }

        fn assert_not _initialized(self: @ContractState)  {
            assert(!self.initialized.rea d(), 'Already initialized');
        } 

        fn assert_valid_address (address: ContractAddress) {
             assert(!address.is_zero(), 'Invalid address ');
        }
    }

    # [external(v0)]
    impl  Contract of super::IContract<ContractState> { 
        fn initialize(ref self: ContractState , owner: ContractAddress) {
             self.assert_not_initialized();
             Internal::assert_valid_address(owner); 

            self.initialized.write(true);
            self .admin.write(owner);

            self .emit(Event::Initialized(Initialized { admin: owner  }));
        }

        fn set_ admin(ref self: ContractState, new _admin: ContractAddress) {
             self.assert_only_admin();
             Internal::assert_valid_address(new_ admin);

            let previous_admin = self .admin.read();
            self.admin .write(new_admin);

            self .emit(Event::AdminChanged(
                AdminChanged {  previous_admin, new_admin }
             ));
        }

        fn get_ admin(self: @ContractState) ->  ContractAddress {
            self.admin. read()
        }
    }
} 
```  