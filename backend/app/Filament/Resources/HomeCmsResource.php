<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomeCmsResource\Pages;
use App\Models\HomeCms;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\FileUpload;

class HomeCmsResource extends Resource
{
    protected static ?string $model = HomeCms::class;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Hero Section')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('hero_title_en')->label('Title (EN)'),
                            TextInput::make('hero_title_zh')->label('Title (ZH)'),
                            TextInput::make('hero_title_ms')->label('Title (MS)'),
                            TextInput::make('hero_main_title_en')->label('Main Title (EN)')->columnSpan(1),
                            TextInput::make('hero_main_title_zh')->label('Main Title (ZH)')->columnSpan(1),
                            TextInput::make('hero_main_title_ms')->label('Main Title (MS)')->columnSpan(1),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('hero_description_en')->label('Description (EN)'),
                            Textarea::make('hero_description_zh')->label('Description (ZH)'),
                            Textarea::make('hero_description_ms')->label('Description (MS)'),
                        ]),
                        FileUpload::make('hero_background_image')->image()->label('Background Image'),
                    ])->collapsible(),

                Section::make('Story Section')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('story_title_en')->label('Title (EN)'),
                            TextInput::make('story_title_zh')->label('Title (ZH)'),
                            TextInput::make('story_title_ms')->label('Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('story_description_en')->label('Description (EN)'),
                            Textarea::make('story_description_zh')->label('Description (ZH)'),
                            Textarea::make('story_description_ms')->label('Description (MS)'),
                        ]),
                        FileUpload::make('story_image')->image()->label('Story Image'),
                    ])->collapsible(),

                Section::make('Why Choose Us Section 1')
                    ->schema([
                        FileUpload::make('why_choose_us_1_icon')->image()->label('Icon'),
                        Grid::make(3)->schema([
                            TextInput::make('why_choose_us_1_title_en')->label('Title (EN)'),
                            TextInput::make('why_choose_us_1_title_zh')->label('Title (ZH)'),
                            TextInput::make('why_choose_us_1_title_ms')->label('Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('why_choose_us_1_description_en')->label('Description (EN)'),
                            Textarea::make('why_choose_us_1_description_zh')->label('Description (ZH)'),
                            Textarea::make('why_choose_us_1_description_ms')->label('Description (MS)'),
                        ]),
                    ])->collapsible(),

                Section::make('Why Choose Us Section 2')
                    ->schema([
                        FileUpload::make('why_choose_us_2_icon')->image()->label('Icon'),
                        Grid::make(3)->schema([
                            TextInput::make('why_choose_us_2_title_en')->label('Title (EN)'),
                            TextInput::make('why_choose_us_2_title_zh')->label('Title (ZH)'),
                            TextInput::make('why_choose_us_2_title_ms')->label('Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('why_choose_us_2_description_en')->label('Description (EN)'),
                            Textarea::make('why_choose_us_2_description_zh')->label('Description (ZH)'),
                            Textarea::make('why_choose_us_2_description_ms')->label('Description (MS)'),
                        ]),
                    ])->collapsible(),

                Section::make('Why Choose Us Section 3')
                    ->schema([
                        FileUpload::make('why_choose_us_3_icon')->image()->label('Icon'),
                        Grid::make(3)->schema([
                            TextInput::make('why_choose_us_3_title_en')->label('Title (EN)'),
                            TextInput::make('why_choose_us_3_title_zh')->label('Title (ZH)'),
                            TextInput::make('why_choose_us_3_title_ms')->label('Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('why_choose_us_3_description_en')->label('Description (EN)'),
                            Textarea::make('why_choose_us_3_description_zh')->label('Description (ZH)'),
                            Textarea::make('why_choose_us_3_description_ms')->label('Description (MS)'),
                        ]),
                    ])->collapsible(),

                Section::make('Business Hours Section')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('business_hours_title_en')->label('Title (EN)'),
                            TextInput::make('business_hours_title_zh')->label('Title (ZH)'),
                            TextInput::make('business_hours_title_ms')->label('Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('business_hours_description_en')->label('Description (EN)'),
                            Textarea::make('business_hours_description_zh')->label('Description (ZH)'),
                            Textarea::make('business_hours_description_ms')->label('Description (MS)'),
                        ]),
                    ])->collapsible(),

                Section::make('Contact Section')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('contact_title_en')->label('Title (EN)'),
                            TextInput::make('contact_title_zh')->label('Title (ZH)'),
                            TextInput::make('contact_title_ms')->label('Title (MS)'),
                        ]),
                        TextInput::make('contact_number')->label('Contact Number'),
                    ])->collapsible(),

                Section::make('Delivery Section')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('delivery_title_en')->label('Title (EN)'),
                            TextInput::make('delivery_title_zh')->label('Title (ZH)'),
                            TextInput::make('delivery_title_ms')->label('Title (MS)'),
                        ]),
                        TextInput::make('delivery_location')->label('Delivery Location'),
                    ])->collapsible(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('hero_title_en')->label('Hero Title (EN)')->searchable(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListHomeCms::route('/'),
            'create' => Pages\CreateHomeCms::route('/create'),
            'edit' => Pages\EditHomeCms::route('/{record}/edit'),
        ];
    }

}
