<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GalleryResource\Pages;
use App\Models\Gallery;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Section;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Illuminate\Database\Eloquent\Builder;

class GalleryResource extends Resource
{
    protected static ?string $model = Gallery::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    protected static ?string $navigationGroup = 'Gallery Management';

    protected static ?string $label = 'Gallery Item';

    protected static ?string $pluralLabel = 'Galleries';

    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 14;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回Category模型的总记录数作为徽章内容
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        // 设置徽章颜色为'success'（绿色）
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Gallery Details')
                ->description('Provide the main details for this gallery item.')
                ->schema([
                    TextInput::make('title')
                        ->label('Title')
                        ->required()
                        ->maxLength(255),
                    Select::make('category')
                        ->label('Category')
                        ->required()
                        ->options([
                            'dishes' => 'Dishes',
                            'packages' => 'Packages',
                            'restaurant' => 'Restaurant',
                            'kitchen' => 'Kitchen',
                        ])
                        ->searchable(),
                    Textarea::make('description')
                        ->label('Description')
                        ->rows(6),
                ]),

            Section::make('Image & Status')
                ->description('Upload an image and set the visibility.')
                ->schema([
                    FileUpload::make('image')
                        ->label('Image')
                        ->directory('gallery')
                        ->image()
                        ->required(),
                    Toggle::make('gallery_status')
                        ->label('Visible')
                        ->inline(false)
                        ->default(true),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->sortable(),
                ImageColumn::make('image')
                    ->label('Image')
                    ->size(60),

                TextColumn::make('title')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('description')
                    ->label('Description')
                    ->limit(50)
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('category')
                    ->label('Category')
                    ->badge()
                    ->sortable(),

                ToggleColumn::make('gallery_status')
                    ->label('Status'),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->since()
                    ->sortable(),

                TextColumn::make('updated_at')
                    ->label('Updated')
                    ->since()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->options([
                        'dishes' => 'Dishes',
                        'packages' => 'Packages',
                        'restaurant' => 'Restaurant',
                        'kitchen' => 'Kitchen',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
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
            'index' => Pages\ListGalleries::route('/'),
            'create' => Pages\CreateGallery::route('/create'),
            'edit' => Pages\EditGallery::route('/{record}/edit'),
        ];
    }
}
