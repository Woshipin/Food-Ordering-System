<div class="p-4">
    @php
        $order = $getRecord();
        $menuItems = $order->menuItems()->with(['menu', 'variants', 'addons'])->get();
        $packageItems = $order->packageItems()->with(['package', 'menus.menu', 'menus.variants', 'menus.addons'])->get();
    @endphp

    <h3 class="text-lg font-semibold mb-4">Menu Items</h3>
    @if($menuItems->isNotEmpty())
        <div class="space-y-4">
            @foreach($menuItems as $item)
                <div class="p-4 border rounded-lg">
                    <div class="flex items-start gap-4">
                        <img src="{{ str_starts_with($item->menu->image_url, 'http') ? $item->menu->image_url : asset('storage/' . $item->menu->image_url) }}" alt="{{ $item->menu->name }}" class="w-24 h-24 rounded-md object-cover">
                        <div class="flex-1">
                            <div class="flex justify-between">
                                <h4 class="font-bold">{{ $item->menu->name }}</h4>
                                <span class="font-bold text-primary-600">RM{{ number_format($item->item_total, 2) }}</span>
                            </div>
                            <p class="text-sm text-gray-500">Quantity: {{ $item->quantity }}</p>

                            @if($item->variants->isNotEmpty())
                                <div class="mt-2">
                                    <h5 class="font-semibold text-sm">Variants:</h5>
                                    <ul class="list-disc list-inside text-sm">
                                        @foreach($item->variants as $variant)
                                            <li>{{ $variant->variant_name }} (+RM{{ number_format($variant->variant_price, 2) }})</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif

                            @if($item->addons->isNotEmpty())
                                <div class="mt-2">
                                    <h5 class="font-semibold text-sm">Add-ons:</h5>
                                    <ul class="list-disc list-inside text-sm">
                                        @foreach($item->addons as $addon)
                                            <li>{{ $addon->addon_name }} (+RM{{ number_format($addon->addon_price, 2) }})</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <p>No menu items in this order.</p>
    @endif

    <h3 class="text-lg font-semibold my-4">Package Items</h3>
    @if($packageItems->isNotEmpty())
        <div class="space-y-4">
            @foreach($packageItems as $item)
                <div class="p-4 border rounded-lg">
                    <div class="flex items-start gap-4">
                        <img src="{{ str_starts_with($item->package->package_image, 'http') ? $item->package->package_image : asset('storage/' . $item->package->package_image) }}" alt="{{ $item->package->package_name }}" class="w-24 h-24 rounded-md object-cover">
                        <div class="flex-1">
                            <div class="flex justify-between">
                                <h4 class="font-bold">{{ $item->package->package_name }}</h4>
                                <span class="font-bold text-primary-600">RM{{ number_format($item->item_total, 2) }}</span>
                            </div>
                            <p class="text-sm text-gray-500">Quantity: {{ $item->quantity }}</p>

                            <div class="mt-2">
                                <h5 class="font-semibold text-sm">Package Menus:</h5>
                                @foreach($item->menus as $packageMenu)
                                    <div class="p-2 border-l-2 mt-2">
                                        <p class="font-medium">{{ $packageMenu->menu->name }}</p>
                                        @if($packageMenu->variants->isNotEmpty())
                                            <div class="mt-1">
                                                <h6 class="font-semibold text-xs">Variants:</h6>
                                                <ul class="list-disc list-inside text-xs">
                                                    @foreach($packageMenu->variants as $variant)
                                                        <li>{{ $variant->variant_name }} (+RM{{ number_format($variant->variant_price, 2) }})</li>
                                                    @endforeach
                                                </ul>
                                            </div>
                                        @endif
                                        @if($packageMenu->addons->isNotEmpty())
                                            <div class="mt-1">
                                                <h6 class="font-semibold text-xs">Add-ons:</h6>
                                                <ul class="list-disc list-inside text-xs">
                                                    @foreach($packageMenu->addons as $addon)
                                                        <li>{{ $addon->addon_name }} (+RM{{ number_format($addon->addon_price, 2) }})</li>
                                                    @endforeach
                                                </ul>
                                            </div>
                                        @endif
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <p>No package items in this order.</p>
    @endif
</div>