<div class="p-4">
    @php
        $order = $getRecord();
        $menuItems = $order->menuItems()->with(['menu.images', 'variants', 'addons'])->get();
        $packageItems = $order->packageItems()->with(['package', 'menus.menu.images', 'menus.variants', 'menus.addons'])->get();
    @endphp

    {{-- Menu Items Section (Original Design) --}}
    @if($menuItems->isNotEmpty())
        <h3 class="text-lg font-semibold mb-4">Menu Items</h3>
        <div class="space-y-4">
            @foreach($menuItems as $item)
                <div class="p-4 border rounded-lg bg-white dark:bg-gray-900">
                    <div class="flex items-start gap-4">
                        @php
                            $menuImageUrl = $item->menu->images->first()?->image_path;
                        @endphp
                        <img src="{{ $menuImageUrl ? (str_starts_with($menuImageUrl, 'http') ? $menuImageUrl : asset('storage/' . $menuImageUrl)) : asset('images/No-Image-Available.jpg') }}" alt="{{ $item->menu->name }}" class="w-20 h-20 rounded-md object-cover">
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-lg">{{ $item->menu->name }}</h4>
                                    <p class="text-sm text-gray-500">Quantity: {{ $item->quantity }}</p>
                                </div>
                                <span class="font-bold text-lg text-primary-600">RM{{ number_format($item->item_total, 2) }}</span>
                            </div>

                            @if($item->variants->isNotEmpty() || $item->addons->isNotEmpty())
                                <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                                    @if($item->variants->isNotEmpty())
                                        <div>
                                            <div class="flex items-center mb-2">
                                                <span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                                <h5 class="font-semibold text-md">规格选择</h5>
                                            </div>
                                            @foreach($item->variants as $variant)
                                                <div class="flex justify-between items-center text-sm ml-5">
                                                    <span>{{ $variant->variant_name }}</span>
                                                    {{-- MODIFIED: Added conditional color class --}}
                                                    <span class="font-semibold @if($variant->variant_price > 0) text-green-500 @else text-red-500 @endif">
                                                        +RM{{ number_format($variant->variant_price, 2) }}
                                                    </span>
                                                </div>
                                            @endforeach
                                        </div>
                                    @endif

                                    @if($item->addons->isNotEmpty())
                                        <div>
                                            <div class="flex items-center mb-2">
                                                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                <h5 class="font-semibold text-md">附加项目</h5>
                                            </div>
                                            @foreach($item->addons as $addon)
                                                <div class="flex justify-between items-center text-sm ml-5">
                                                    <span>{{ $addon->addon_name }}</span>
                                                    {{-- MODIFIED: Added conditional color class --}}
                                                    <span class="font-semibold @if($addon->addon_price > 0) text-green-500 @else text-red-500 @endif">
                                                        +RM{{ number_format($addon->addon_price, 2) }}
                                                    </span>
                                                </div>
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    {{-- Package Items Section (Original Design) --}}
    @if($packageItems->isNotEmpty())
        <h3 class="text-lg font-semibold my-4">Package Items</h3>
        <div class="space-y-4">
            @foreach($packageItems as $item)
                <div class="p-4 border rounded-lg bg-white dark:bg-gray-900">
                    <div class="flex items-start gap-4">
                        <img src="{{ $item->package->image ? (str_starts_with($item->package->image, 'http') ? $item->package->image : asset('storage/' . $item->package->image)) : asset('images/No-Image-Available.jpg') }}" alt="{{ $item->package->package_name }}" class="w-20 h-20 rounded-md object-cover">
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-lg">{{ $item->package->package_name }}</h4>
                                    <p class="text-sm text-gray-500">Quantity: {{ $item->quantity }}</p>
                                </div>
                                <span class="font-bold text-lg text-primary-600">RM{{ number_format($item->item_total, 2) }}</span>
                            </div>

                            <div class="mt-4 space-y-4">
                                @foreach($item->menus as $index => $packageMenu)
                                    <div class="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
                                        <div class="flex items-start gap-4">
                                            <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-sm">{{ $index + 1 }}</span>
                                            <div class="flex-1">
                                                <h5 class="font-semibold text-md">{{ $packageMenu->menu->name }}</h5>
                                                
                                                @if($packageMenu->variants->isNotEmpty() || $packageMenu->addons->isNotEmpty())
                                                    <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                                                        @if($packageMenu->variants->isNotEmpty())
                                                            <div>
                                                                <div class="flex items-center mb-2">
                                                                    <span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                                                                    <h6 class="font-semibold text-md">规格选择</h6>
                                                                </div>
                                                                @foreach($packageMenu->variants as $variant)
                                                                    <div class="flex justify-between items-center text-sm ml-5">
                                                                        <span>{{ $variant->variant_name }}</span>
                                                                        {{-- MODIFIED: Added conditional color class --}}
                                                                        <span class="font-semibold @if($variant->variant_price > 0) text-green-500 @else text-red-500 @endif">
                                                                            +RM{{ number_format($variant->variant_price, 2) }}
                                                                        </span>
                                                                    </div>
                                                                @endforeach
                                                            </div>
                                                        @endif

                                                        @if($packageMenu->addons->isNotEmpty())
                                                            <div>
                                                                <div class="flex items-center mb-2">
                                                                    <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                                    <h6 class="font-semibold text-md">附加项目</h6>
                                                                </div>
                                                                @foreach($packageMenu->addons as $addon)
                                                                    <div class="flex justify-between items-center text-sm ml-5">
                                                                        <span>{{ $addon->addon_name }}</span>
                                                                        {{-- MODIFIED: Added conditional color class --}}
                                                                        <span class="font-semibold @if($addon->addon_price > 0) text-green-500 @else text-red-500 @endif">
                                                                            +RM{{ number_format($addon->addon_price, 2) }}
                                                                        </span>
                                                                    </div>
                                                                @endforeach
                                                            </div>
                                                        @endif
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    @if($menuItems->isEmpty() && $packageItems->isEmpty())
        <p>No items in this order.</p>
    @endif
</div>