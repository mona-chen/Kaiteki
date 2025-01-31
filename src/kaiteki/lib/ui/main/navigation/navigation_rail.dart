import "package:flutter/material.dart";
import "package:go_router/go_router.dart";
import "package:kaiteki/di.dart";
import "package:kaiteki/ui/main/tab.dart";
import "package:kaiteki/utils/extensions.dart";
import "package:kaiteki_ui/kaiteki_ui.dart";

class MainScreenNavigationRail extends ConsumerWidget {
  final List<MainScreenTab> tabs;
  final int currentIndex;
  final ValueChanged<int>? onChangeIndex;
  final Color? backgroundColor;

  const MainScreenNavigationRail({
    super.key,
    required this.tabs,
    required this.currentIndex,
    this.onChangeIndex,
    this.backgroundColor,
  });

  List<NavigationRailDestination> _destinations(BuildContext context) {
    final destinations = <NavigationRailDestination>[];
    for (final tab in tabs) {
      final unreadCount = tab.fetchUnreadCount?.call() ?? 0;
      destinations.add(
        NavigationRailDestination(
          icon: Icon(tab.kind.icon).wrapWithBadge(unreadCount),
          selectedIcon: Icon(tab.kind.selectedIcon).wrapWithBadge(unreadCount),
          label: Text(tab.kind.getLabel(context)),
        ),
      );
    }
    return destinations;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return NavigationRail(
      backgroundColor: backgroundColor,
      useIndicator: theme.useMaterial3,
      selectedIndex: currentIndex,
      onDestinationSelected: onChangeIndex,
      minWidth: theme.useMaterial3 ? null : 56,
      labelType: NavigationRailLabelType.all,
      leading: FloatingActionButton(
        backgroundColor: theme.colorScheme.tertiaryContainer,
        foregroundColor: theme.colorScheme.onTertiaryContainer,
        elevation: 0,
        onPressed: () {
          context.pushNamed("compose", pathParameters: ref.accountRouterParams);
        },
        heroTag: const ValueKey("navigation rail"),
        child: const Icon(Icons.edit_rounded),
      ),
      destinations: _destinations(context),
    );
  }
}
