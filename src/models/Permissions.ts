interface Permissions {
  order: {
    show?: boolean;
    edit?: boolean;
    close?: boolean;
    reschedule?: boolean;
    cancel?: boolean;
    schedule: {
      allow?: boolean;
      rural?: boolean;
      holiday?: boolean;
      shift_full?: boolean;
      duplicate_schedule?: boolean;
      another_city?: boolean;
      system_closed?: boolean;
    };
  };
  schedule: {
    show?: boolean;
    shift: {
      change_vacancy?: boolean;
    };
    calendar: {
      select_past?: boolean;
    };
  };
  orders: {
    show?: boolean;
  };
  holidays: {
    show?: boolean;
  };
  settings: {
    show?: boolean;
    users: {
      show?: boolean;
    };
    shifts: {
      show?: boolean;
    };
    cities: {
      show?: boolean;
    };
    shift_types: {
      show?: boolean;
    };
    tecnologies: {
      show?: boolean;
    };
    roles: {
      show?: boolean;
    };
    compositions: {
      show?: boolean;
    };
    plans: {
      show?: boolean;
    };
    products: {
      show?: boolean;
    };
    taxes: {
      show?: boolean;
    };
    contract_types: {
      show?: boolean;
    };
  };
  contract: {
    show?: boolean;
    add?: boolean;
    import: {
      allow?: boolean;
      edit_tax_value?: boolean;
    };
    edit?: boolean;
    fix: {
      allow?: boolean;
      after_limit_date?: boolean;
    };
    products: {
      allow?: boolean;
      edit_value?: boolean;
    };
    renew: {
      allow?: boolean;
      change_plan?: boolean;
      edit_monthly_price?: boolean;
      edit_monthly_benefit?: boolean;
      edit_month_amount?: boolean;
      before_min_date?: boolean;
    };
    delete_renew?: boolean;
    delete?: boolean;
    print?: boolean;
  };
  import_contract: {
    show?: boolean;
  };
  contracts: {
    show?: boolean;
  };
  phone_number: {
    show?: boolean;
    add: {
      allow?: boolean;
      change_ddd_prefix?: boolean;
      interval?: boolean;
    };
    edit?: boolean;
    bind: {
      allow?: boolean;
      another_city?: boolean;
    };
    unbind?: boolean;
    reserve?: boolean;
    release?: boolean;
    delete?: boolean;
  };
  telephony: {
    show?: boolean;
    add_portability?: boolean;
  };
  phone_numbers: {
    show?: boolean;
    add?: boolean;
  };
}

export default Permissions;
