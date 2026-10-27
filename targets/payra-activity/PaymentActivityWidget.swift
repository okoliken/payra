import ActivityKit
import SwiftUI
import WidgetKit

/// Live Activity for a payment on its way: Dynamic Island (compact, minimal, expanded) and the
/// lock screen. While it is in flight the ring fills on its own between `startedAt` and
/// `deliveredAt`; then the app sends `delivered: true` (the stale date at `deliveredAt` is only
/// a fallback, since the system re-renders stale activities late).
struct PaymentActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PaymentAttributes.self) { context in
            LockScreenView(context: context)
                .activityBackgroundTint(Color("brandDark"))
                .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            let done = context.state.delivered || context.isStale
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Mark(size: 22).padding(.leading, 8).padding(.top, 6)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    StatusPill(context: context, done: done).padding(.trailing, 8).padding(.top, 6)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 12) {
                        Summary(context: context, secondary: .secondary)
                        Bar(context: context, done: done)
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 4)
                    .padding(.bottom, 10)
                }
            } compactLeading: {
                HStack(spacing: 6) {
                    Mark(size: 18)
                    Text(status(context, done: done))
                        .font(.system(size: 14, weight: .semibold))
                        .contentTransition(.interpolate)
                        .animation(.smooth(duration: 0.8), value: done)
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

/// Circular progress that fills by itself until delivery, then springs into a check.
private struct Ring: View {
    var context: ActivityViewContext<PaymentAttributes>
    var done: Bool
    var body: some View {
        ZStack {
            if done {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 18))
                    .foregroundStyle(Color("success"))
                    .transition(.scale(scale: 0.1).combined(with: .opacity))
            } else {
                ProgressView(
                    timerInterval: context.attributes.startedAt...context.state.deliveredAt,
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.circular)
                .tint(Color("brand"))
                .transition(.scale(scale: 1.4).combined(with: .opacity))
            }
        }
        .frame(width: 18, height: 18)
        .animation(.spring(duration: 1.0, bounce: 0.5), value: done)
    }
}

/// "Sending" / "Sent" chip; turns green with a check on delivery.
private struct StatusPill: View {
    var context: ActivityViewContext<PaymentAttributes>
    var done: Bool
    var body: some View {
        let tint = done ? Color("success") : Color("brand")
        HStack(spacing: 4) {
            if done {
                Image(systemName: "checkmark")
                    .font(.system(size: 11, weight: .bold))
                    .transition(.scale(scale: 0.1).combined(with: .opacity))
            }
            Text(status(context, done: done))
                .font(.system(size: 13, weight: .semibold))
                .contentTransition(.interpolate)
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(tint.opacity(0.18), in: Capsule())
        .animation(.spring(duration: 1.0, bounce: 0.5), value: done)
    }
}

/// The amount as the hero, then who it is for, with the account number masked.
private struct Summary: View {
    var context: ActivityViewContext<PaymentAttributes>
    var secondary: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(signedAmount(context))
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .monospacedDigit()
            HStack(spacing: 6) {
                Text("\(incoming(context) ? "from" : "to") \(context.attributes.counterparty)")
                    .font(.system(size: 14, weight: .semibold))
                    .lineLimit(1)
                Text(maskedDetail(context.attributes.detail))
                    .font(.system(size: 13))
                    .foregroundStyle(secondary)
                    .lineLimit(1)
            }
        }
    }
}

/// Rounded progress bar: fills on its own until delivery, then turns solid green.
private struct Bar: View {
    var context: ActivityViewContext<PaymentAttributes>
    var done: Bool
    var body: some View {
        ZStack {
            if done {
                Capsule().fill(Color("success")).frame(height: 4).transition(.opacity)
            } else {
                ProgressView(
                    timerInterval: context.attributes.startedAt...context.state.deliveredAt,
                    countsDown: false,
                    label: { EmptyView() },
                    currentValueLabel: { EmptyView() }
                )
                .progressViewStyle(.linear)
                .tint(Color("brand"))
                .transition(.opacity)
            }
        }
        .clipShape(Capsule())
        .animation(.easeInOut(duration: 0.9), value: done)
    }
}

/// "BRI · 3301298877665" → "BRI ···· 7665": enough to recognise, not the whole number.
private func maskedDetail(_ detail: String) -> String {
    let parts = detail.components(separatedBy: " · ")
    guard parts.count == 2, parts[1].count > 4, parts[1].allSatisfy(\.isNumber) else { return detail }
    return "\(parts[0]) ···· \(parts[1].suffix(4))"
}

private struct LockScreenView: View {
    var context: ActivityViewContext<PaymentAttributes>
    var body: some View {
        let done = context.state.delivered || context.isStale
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Mark(size: 22)
                Spacer()
                StatusPill(context: context, done: done)
            }
            Summary(context: context, secondary: .white.opacity(0.6))
            Bar(context: context, done: done)
        }
        .foregroundStyle(.white)
        .padding(18)
    }
}

@main
struct PayraActivityBundle: WidgetBundle {
    var body: some Widget {
        PaymentActivityWidget()
    }
}
