import ActivityKit
import ExpoModulesCore
import UIKit

/// How long "Sent" stays in the Dynamic Island before the activity goes away.
private let lingerAfterDelivery: TimeInterval = 8

/// JS bridge for the payment Live Activity (rendered by targets/payra-activity).
public class PayraActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PayraActivity")

    /// Starts a payment activity; the ring fills over `seconds`, then it shows as delivered and
    /// ends shortly after. Returns false when Live Activities are off or unsupported.
    Function("start") { (direction: String, amount: String, counterparty: String, detail: String, seconds: Double) -> Bool in
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
      let now = Date()
      let deliveredAt = now.addingTimeInterval(seconds)
      let attributes = PaymentAttributes(
        direction: direction, amount: amount, counterparty: counterparty, detail: detail, startedAt: now)
      let content = ActivityContent(state: PaymentAttributes.ContentState(deliveredAt: deliveredAt), staleDate: deliveredAt)
      do {
        let activity = try Activity.request(attributes: attributes, content: content)
        Self.finish(activity, deliveredAt: deliveredAt, after: seconds)
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

  /// Marks the payment delivered on time, then ends it. Runs inside a background task so it
  /// still happens if the user leaves the app straight after sending (iOS allows ~30s).
  private static func finish(_ activity: Activity<PaymentAttributes>, deliveredAt: Date, after seconds: Double) {
    Task { @MainActor in
      var task = UIBackgroundTaskIdentifier.invalid
      task = UIApplication.shared.beginBackgroundTask { UIApplication.shared.endBackgroundTask(task) }
      defer { UIApplication.shared.endBackgroundTask(task) }

      try? await Task.sleep(nanoseconds: UInt64(max(seconds, 0) * 1_000_000_000))
      let delivered = ActivityContent(
        state: PaymentAttributes.ContentState(deliveredAt: deliveredAt, delivered: true), staleDate: nil)
      // The alert makes iOS briefly expand the Dynamic Island (and wake the lock screen) to
      // announce delivery; the widget animates the ring into a check while it is open.
      let who = activity.attributes.counterparty
      let incoming = activity.attributes.direction == "incoming"
      await activity.update(delivered, alertConfiguration: AlertConfiguration(
        title: incoming ? "Payment received" : "Payment sent",
        body: incoming ? "\(activity.attributes.amount) from \(who)" : "\(activity.attributes.amount) to \(who)",
        sound: .default))

      try? await Task.sleep(nanoseconds: UInt64(lingerAfterDelivery * 1_000_000_000))
      await activity.end(delivered, dismissalPolicy: .immediate)
    }
  }
}
