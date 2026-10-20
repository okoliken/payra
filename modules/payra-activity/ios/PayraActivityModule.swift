import ActivityKit
import ExpoModulesCore

/// JS bridge for the payment Live Activity (rendered by targets/payra-activity).
public class PayraActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PayraActivity")

    /// Starts a payment activity; the ring fills over `seconds` and it shows as delivered after.
    /// Returns false when Live Activities are off or unsupported.
    Function("start") { (direction: String, amount: String, counterparty: String, detail: String, seconds: Double) -> Bool in
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
      let now = Date()
      let deliveredAt = now.addingTimeInterval(seconds)
      let attributes = PaymentAttributes(
        direction: direction, amount: amount, counterparty: counterparty, detail: detail, startedAt: now)
      let content = ActivityContent(state: PaymentAttributes.ContentState(deliveredAt: deliveredAt), staleDate: deliveredAt)
      do {
        _ = try Activity.request(attributes: attributes, content: content)
        return true
      } catch {
        return false
      }
    }

    /// Ends activities whose payment has been delivered (called when the app comes back).
    AsyncFunction("endDelivered") {
      for activity in Activity<PaymentAttributes>.activities where activity.content.state.deliveredAt <= Date() {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }
}
