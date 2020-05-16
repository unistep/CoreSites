export enum CommandId {
    // Main
    None = 0,
    Login,
    Logout,
    Search,
    Idle,
    Sale,
    SearchPrevSale,
    HandlePrevSale,
    Print,
    FinishSelect,
    Plus,
    Minus,
    SearchItem,
    PrevItem,
    NextItem,
    GeneralItem,
    ReturnNote,

    // Person
    SearchMember,

    // Transactions
    SuspendTran,
    CancelTran,
    LastTran,
    SearchSale,
    GeneralDiscount,

    // Payment
    StartPayment,
    RemoveLine,

    PayWithCash,
    PayCheque,
    PayWithoutReceipt,

    RecognizeCreditCard,
    CardRegularPayment,
    CardPartialPayment,
    CardCreditPayment,

    CreditNotePayment,
    GiftCardPayment,
    BuyMePayment,
    ResumeSale,

    PrintInvoice,
    SendDigitalInvoice,

    // Refunds
    RefundItems,
    ReturnItems,
    EditRefundItem,
    EditRefundTrender,
    RegonnizeCoupon,

    // Popups
    Ok,
    Cancel,

    // Charge gift card
    GiftCardDiscount,

    // member
    OpenTransactionHistory,

    // repair reauest
    OpenRepairRequest
}
