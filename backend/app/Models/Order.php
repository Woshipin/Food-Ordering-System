<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'subtotal',
        'delivery_fee',
        'discount_amount',
        'total_amount',
        'service_method',
        'payment_method',
        'payment_status',
        'promo_code',
        'special_instructions',
        'pickup_time',
        'delivery_name',
        'delivery_phone',
        'delivery_address',
        'delivery_building',
        'delivery_floor',
        'delivery_latitude',
        'delivery_longitude',
        // 桌位相关字段
        'table_id',
        'table_code',   // 修正：使用table_code而不是table_name
        'time_slot_id', // 用户选择的时间段ID
        'dining_date',
        'checkin_time',
        'checkout_time',
        'guests_count',
        'auto_extend_count',
        'total_extended_minutes',
        'table_status',
        'requires_table',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal'               => 'decimal:2',
        'delivery_fee'           => 'decimal:2',
        'discount_amount'        => 'decimal:2',
        'total_amount'           => 'decimal:2',
        'pickup_time'            => 'datetime',
        // 桌位相关字段的类型转换
        'dining_date'            => 'date',
        // checkin_time 和 checkout_time 保持为字符串格式（HH:MM:SS）
        'guests_count'           => 'integer',
        'auto_extend_count'      => 'integer',
        'total_extended_minutes' => 'integer',
        'requires_table'         => 'boolean',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all of the menu items for the order.
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(OrderMenuItem::class);
    }

    /**
     * Get all of the package items for the order.
     */
    public function packageItems(): HasMany
    {
        return $this->hasMany(OrderPackageItem::class);
    }

    /**
     * Get the table associated with the order.
     * 获取订单关联的桌位信息
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    /**
     * Get the time slot associated with the order.
     * 获取订单关联的时间段信息
     */
    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    /**
     * 检查订单是否需要桌位（dine-in订单）
     */
    public function requiresTable(): bool
    {
        return $this->requires_table === true;
    }

    /**
     * 检查订单是否已经入座（现在pending状态代表正在使用桌位）
     */
    public function isSeated(): bool
    {
        return $this->table_status === 'pending';
    }

    /**
     * 检查订单是否超过预计离座时间
     */
    public function isOverdue(): bool
    {
        if (! $this->checkout_time || ! $this->dining_date || ! $this->isSeated()) {
            return false;
        }

        // 结合用餐日期和离座时间来创建完整的日期时间
        // checkout_time 现在是字符串格式（HH:MM:SS）
        $checkoutDateTime = \Carbon\Carbon::parse($this->dining_date->format('Y-m-d') . ' ' . $this->checkout_time);

        return now()->isAfter($checkoutDateTime);
    }

    /**
     * 检查是否可以自动延长（最多2次，每次30分钟）
     */
    public function canAutoExtend(): bool
    {
        return $this->auto_extend_count < 2;
    }

    /**
     * 获取当前订单的实际结束时间（包括延长时间）
     */
    public function getActualEndTime(): \Carbon\Carbon
    {
        if (! $this->checkout_time || ! $this->dining_date) {
            return now();
        }

        // 结合用餐日期和离座时间来创建完整的日期时间
        // checkout_time 现在是字符串格式（HH:MM:SS）
        $checkoutDateTime = \Carbon\Carbon::parse($this->dining_date->format('Y-m-d') . ' ' . $this->checkout_time);

        return $checkoutDateTime->addMinutes($this->total_extended_minutes);
    }
}
