<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OurValueResource\Pages;
use App\Filament\Resources\OurValueResource\RelationManagers;
use App\Models\OurValue;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
// 新增引入的类
use Filament\Forms\Components\Section;
use Filament\Tables\Columns\ImageColumn;

class OurValueResource extends Resource
{
    protected static ?string $model = OurValue::class;

    protected static ?string $navigationIcon = 'heroicon-o-light-bulb';

    protected static ?string $navigationGroup = 'About Us CMS Management';

    // [优化] 遵循Filament最佳实践，使用单数形式，Filament会自动处理复数
    protected static ?string $label = 'Our Value';

    protected static ?int $navigationSort = 4;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // [核心修改] 添加一个大的外层Section，将所有表单项包裹起来
                Section::make('Value Details')
                    ->description('Provide the details for this core value.')
                    ->schema([
                        Forms\Components\Select::make('icon')
                            ->label('Icon')
                            ->options([
                                'Heart' => 'Heart',
                                'Award' => 'Award',
                                'Users' => 'Users',
                            ])
                            ->required(),

                        // [优化] 使用 "小Section" 将标题相关的多语言字段分组
                        Section::make('Title')
                            ->schema([
                                Forms\Components\TextInput::make('title_en')->label('Title (EN)')->required(),
                                Forms\Components\TextInput::make('title_zh')->label('Title (ZH)')->required(),
                                Forms\Components\TextInput::make('title_ms')->label('Title (MS)')->required(),
                            ])
                            ->columns(3), // 标题输入框在一行内显示，更紧凑

                        // [优化] 使用另一个 "小Section" 将描述相关的多语言字段分组
                        Section::make('Description')
                            ->schema([
                                Forms\Components\Textarea::make('description_en')->label('Description (EN)')->rows(5)->required(),
                                Forms\Components\Textarea::make('description_zh')->label('Description (ZH)')->rows(5)->required(),
                                Forms\Components\Textarea::make('description_ms')->label('Description (MS)')->rows(5)->required(),
                            ]),
                    ]),
            ])
            // [核心修改] 强制整个表单为单列布局，实现所有Section和字段垂直排列
            ->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // [优化] 使用ImageColumn直接预览图片，并放在第一列
                Tables\Columns\IconColumn::make('icon')
                    ->label('Icon')
                    ->icon(fn (string $state): string => match ($state) {
                        'Heart' => 'heroicon-o-heart',
                        'Award' => 'heroicon-o-trophy',
                        'Users' => 'heroicon-o-users',
                        default => 'heroicon-o-question-mark-circle',
                    })
                   ->color('warning'),

                Tables\Columns\TextColumn::make('title_en')
                    ->label('Title (EN)')
                    ->searchable()
                    ->sortable(),

                // [优化] 默认隐藏其他语言的标题，保持表格简洁
                Tables\Columns\TextColumn::make('title_zh')
                    ->label('Title (ZH)')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('title_ms')
                    ->label('Title (MS)')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOurValues::route('/'),
            'create' => Pages\CreateOurValue::route('/create'),
            'edit' => Pages\EditOurValue::route('/{record}/edit'),
        ];
    }
}
