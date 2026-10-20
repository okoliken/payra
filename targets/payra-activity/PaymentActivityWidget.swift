import ActivityKit
import SwiftUI
import WidgetKit

/// Live Activity for a payment on its way: Dynamic Island (compact, minimal, expanded) and the
/// lock screen. While it is in flight the ring fills on its own between `startedAt` and
/// `deliveredAt` (no updates needed); the activity's stale date is `deliveredAt`, so the system
/// re-renders it then and it switches to the delivered state.
struct PaymentActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: PaymentAttributes.self) { context in
      LockScreenView(context: context)
        .activityBackgroundTint(Color("brandDark"))
        .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      let done = context.isStale
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Mark(size: 26).padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(signedAmount(context))
            .font(.system(size: 17, weight: .semibold))
            .monospacedDigit()
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 8) {
            Text(headline(context, done: done))
              .font(.system(size: 15, weight: .semibold))
            Text(context.attributes.detail)
              .font(.system(size: 13))
              .foregroundStyle(.secondary)
            Progress(context: context, done: done)
          }
          .padding(.horizontal, 4)
        }
      } compactLeading: {
        HStack(spacing: 6) {
          Mark(size: 18)
          Text(status(context, done: done))
            .font(.system(size: 14, weight: .semibold))
        }
      } compactTrailing: {
        HStack(spacing: 6) {
          Text(signedAmount(context))
            .font(.system(size: 14, weight: .semibold))
            .monospacedDigit()
          Ring(context: context, done: done)
        }
      } minimal: {
        Ring(context: context, done: done)
      }
      .keylineTint(Color("brand"))
    }
  }
}

private func incoming(_ context: ActivityViewContext<PaymentAttributes>) -> Bool {
  context.attributes.direction == "incoming"
}

private func status(_ context: ActivityViewContext<PaymentAttributes>, done: Bool) -> String {
  incoming(context) ? (done ? "Received" : "Incoming") : (done ? "Sent" : "Sending")
}

private func signedAmount(_ context: ActivityViewContext<PaymentAttributes>) -> String {
  incoming(context) ? "+\(context.attributes.amount)" : context.attributes.amount
}

private func headline(_ context: ActivityViewContext<PaymentAttributes>, done: Bool) -> String {
  let who = context.attributes.counterparty
  if incoming(context) { return done ? "Received from \(who)" : "Incoming from \(who)" }
  return done ? "Sent to \(who)" : "Sending to \(who)"
}

/// The Payra mark from the Figma file.
private struct Mark: View {
  var size: CGFloat
  var body: some View {
    Image("payraMark")
      .resizable()
      .scaledToFit()
      .frame(width: size * 4 / 3, height: size)
  }
}

/// Circular progress that fills by itself until delivery, then becomes a check.
private struct Ring: View {
  var context: ActivityViewContext<PaymentAttributes>
  var done: Bool
  var body: some View {
    if done {
      Image(systemName: "checkmark.circle.fill")
        .font(.system(size: 18))
        .foregroundStyle(Color("success"))
    } else {
      ProgressView(
        timerInterval: context.attributes.startedAt...context.state.deliveredAt,
        countsDown: false,
        label: { EmptyView() },
        currentValueLabel: { EmptyView() }
      )
      .progressViewStyle(.circular)
      .tint(Color("brand"))
      .frame(width: 18, height: 18)
    }
  }
}

/// Linear version for the expanded island and the lock screen.
private struct Progress: View {
  var context: ActivityViewContext<PaymentAttributes>
  var done: Bool
  var body: some View {
    if done {
      ProgressView(value: 1).tint(Color("success"))
    } else {
      ProgressView(
        timerInterval: context.attributes.startedAt...context.state.deliveredAt,
        countsDown: false,
        label: { EmptyView() },
        currentValueLabel: { EmptyView() }
      )
      .tint(Color("brand"))
    }
  }
}

private struct LockScreenView: View {
  var context: ActivityViewContext<PaymentAttributes>
  var body: some View {
    let done = context.isStale
    VStack(alignment: .leading, spacing: 12) {
      HStack(spacing: 12) {
        Mark(size: 28)
        VStack(alignment: .leading, spacing: 2) {
          Text(headline(context, done: done))
            .font(.system(size: 15, weight: .semibold))
          Text(context.attributes.detail)
            .font(.system(size: 13))
            .foregroundStyle(.white.opacity(0.7))
        }
        Spacer()
        Text(signedAmount(context))
          .font(.system(size: 17, weight: .semibold))
          .monospacedDigit()
      }
      Progress(context: context, done: done)
    }
    .foregroundStyle(.white)
    .padding(16)
  }
}

@main
struct PayraActivityBundle: WidgetBundle {
  var body: some Widget {
    PaymentActivityWidget()
  }
}
