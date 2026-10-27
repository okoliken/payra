import ActivityKit
import Foundation

// Must match modules/payra-activity/ios/PaymentAttributes.swift exactly: the app starts the
// activity with this type and the widget renders it.
struct PaymentAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    /// When delivery is expected to finish; the ring fills up to this moment.
    var deliveredAt: Date
    /// Set by the app once the payment lands, so the widget flips right away instead of
    /// waiting for the system to notice the stale date.
    var delivered: Bool = false
  }

  var direction: String  // "outgoing" | "incoming"
  var amount: String  // "$1,000.00"
  var counterparty: String  // "Abigail Sari"
  var detail: String  // "BCA · 0912345678"
  var startedAt: Date
}
