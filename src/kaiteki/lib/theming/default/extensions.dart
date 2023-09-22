import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:kaiteki/preferences/theme_preferences.dart" as preferences;
import "package:kaiteki/theming/kaiteki/theme.dart";
import "package:kaiteki/ui/shared/emoji/emoji_theme.dart";
import "package:kaiteki/ui/shared/posts/avatar_widget.dart";

extension ThemeDataExtensions on ThemeData {
  ThemeData applyUserPreferences(WidgetRef ref) {
    ShapeBorder getAvatarShape(double cornerRadius) {
      return switch (cornerRadius) {
        <= 0 => const Border(),
        >= double.infinity => const CircleBorder(),
        _ => RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(cornerRadius),
          ),
      };
    }

    final avatarCornerRadius = ref.watch(preferences.avatarCornerRadius).value;
    final useNaturalBadgeColors =
        ref.watch(preferences.useNaturalBadgeColors).value;

    return copyWith(
      extensions: [
        ...extensions.values,
        EmojiTheme(square: ref.watch(preferences.squareEmojis).value),
        AvatarTheme(shape: getAvatarShape(avatarCornerRadius)),
      ],
      badgeTheme: useNaturalBadgeColors
          ? badgeTheme.copyWith(
              backgroundColor: colorScheme.inverseSurface,
              textColor: colorScheme.onInverseSurface,
            )
          : null,
    );
  }

  ThemeData applyDefaultTweaks() {
    final navigationBarForegroundColor =
        colorScheme.brightness == Brightness.dark
            ? colorScheme.onSurface
            : colorScheme.onPrimary;
    return copyWith(
      snackBarTheme: snackBarTheme.copyWith(
        behavior: SnackBarBehavior.floating,
      ),
      floatingActionButtonTheme: floatingActionButtonTheme.copyWith(
        extendedTextStyle: textTheme.labelLarge ?? const TextStyle(),
      ),
      dividerTheme: dividerTheme.copyWith(space: 1, thickness: 1),
      tabBarTheme: tabBarTheme.copyWith(
        // Flutter themes the TabBar to be readable against the primary color,
        // since we don't live in Material Design 1 times where everything is
        // eye-soring colorful, we'll use the primary color.
        labelColor: useMaterial3 ? null : colorScheme.primary,
        indicatorColor: useMaterial3 ? null : colorScheme.primary,
        unselectedLabelColor: useMaterial3
            ? null
            : colorScheme.onSurface.withOpacity(.6) /* medium emphasis */,
        // And there @Craftplacer said, "THIS DIVIDER SUCKS"
        dividerColor: Colors.transparent,
      ),
      bottomNavigationBarTheme: bottomNavigationBarTheme.copyWith(
        backgroundColor: colorScheme.brightness == Brightness.dark
            ? colorScheme.surface
            : colorScheme.primary,
        selectedItemColor: navigationBarForegroundColor,
        unselectedItemColor: navigationBarForegroundColor.withOpacity(0.76),
        showSelectedLabels: true,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }

  /// Adds Kaiteki-specific extensions to the theme.
  ThemeData addKaitekiTheme() {
    return copyWith(
      extensions: [
        ...extensions.values,
        KaitekiTheme.fromMaterialTheme(this),
      ],
    );
  }
}
