#[starknet::contract]
mod contract {
    use starknet::{ContractAddress, get_caller_address};
    use zeroable::Zeroable;
    use traits::Into;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        admins: LegacyMap<ContractAddress, bool>,
        is_initialized: bool,
        is_paused: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnershipTransferred: OwnershipTransferred,
        AdminStatusChanged: AdminStatusChanged,
        ContractPaused: ContractPaused,
        ContractUnpaused: ContractUnpaused,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct AdminStatusChanged {
        admin: ContractAddress,
        status: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct ContractPaused {
        paused_by: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct ContractUnpaused {
        unpaused_by: ContractAddress
    }

    mod Errors {
        const INVALID_ADDRESS: felt252 = 'Invalid address';
        const UNAUTHORIZED: felt252 = 'Unauthorized';
        const ALREADY_INITIALIZED: felt252 = 'Already initialized';
        const CONTRACT_PAUSED: felt252 = 'Contract is paused';
        const CONTRACT_NOT_PAUSED: felt252 = 'Contract not paused';
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        initial_owner: ContractAddress
    ) {
        assert(!initial_owner.is_zero(), Errors::INVALID_ADDRESS);
        assert(!self.is_initialized.read(), Errors::ALREADY_INITIALIZED);

        self.owner.write(initial_owner);
        self.admins.write(initial_owner, true);
        self.is_paused.write(false);
        self.is_initialized.write(true);
    }

    #[external(v0)]
    fn transfer_ownership(
        ref self: ContractState,
        new_owner: ContractAddress
    ) {
        self.only_owner();
        self.ensure_not_paused();

        assert(!new_owner.is_zero(), Errors::INVALID_ADDRESS);
        
        let previous_owner = self.owner.read();
        self.owner.write(new_owner);
        self.admins.write(new_owner, true);
        
        self.emit(Event::OwnershipTransferred(OwnershipTransferred {
            previous_owner: previous_owner,
            new_owner: new_owner
        }));
    }

    #[external(v0)]
    fn set_admin(
        ref self: ContractState,
        admin: ContractAddress,
        status: bool
    ) {
        self.only_owner();
        self.ensure_not_paused();

        assert(!admin.is_zero(), Errors::INVALID_ADDRESS);
        
        self.admins.write(admin, status);
        self.emit(Event::AdminStatusChanged(AdminStatusChanged { admin, status }));
    }

    #[external(v0)]
    fn pause(ref self: ContractState) {
        self.only_owner_or_admin();
        self.ensure_not_paused();
        
        self.is_paused.write(true);
        self.emit(Event::ContractPaused(ContractPaused { paused_by: get_caller_address() }));
    }

    #[external(v0)]
    fn unpause(ref self: ContractState) {
        self.only_owner_or_admin();
        self.ensure_paused();
        
        self.is_paused.write(false);
        self.emit(Event::ContractUnpaused(ContractUnpaused { unpaused_by: get_caller_address() }));
    }

    #[generate_trait]
    impl Internal of InternalTrait {
        fn only_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), Errors::UNAUTHORIZED);
        }

        fn only_admin(self: @ContractState) {
            let caller = get_caller_address();
            assert(self.admins.read(caller), Errors::UNAUTHORIZED);
        }

        fn only_owner_or_admin(self: @ContractState) {
            let caller = get_caller_address();
            assert(
                caller == self.owner.read() || self.admins.read(caller),
                Errors::UNAUTHORIZED
            );
        }

        fn ensure_not_paused(self: @ContractState) {
            assert(!self.is_paused.read(), Errors::CONTRACT_PAUSED);
        }

        fn ensure_paused(self: @ContractState) {
            assert(self.is_paused.read(), Errors::CONTRACT_NOT_PAUSED);
        }
    }
}