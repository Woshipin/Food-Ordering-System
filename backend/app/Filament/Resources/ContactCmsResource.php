<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactCmsResource\Pages;
use App\Models\ContactCms;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;

class ContactCmsResource extends Resource
{
    protected static ?string $model = ContactCms::class;

    protected static ?string $navigationIcon = 'heroicon-o-phone-arrow-up-right';
    protected static ?string $navigationLabel = 'Contact Us CMS';
    protected static ?string $slug = 'contact-us';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Contact Section')
                ->schema([
                    Grid::make(3)->schema([
                        TextInput::make('contact_title_en')->label('Title (EN)'),
                        TextInput::make('contact_title_zh')->label('Title (ZH)'),
                        TextInput::make('contact_title_ms')->label('Title (MS)'),
                    ]),
                    Grid::make(3)->schema([
                        Textarea::make('contact_description_en')->label('Description (EN)'),
                        Textarea::make('contact_description_zh')->label('Description (ZH)'),
                        Textarea::make('contact_description_ms')->label('Description (MS)'),
                    ]),
                ])->collapsible(),

            Section::make('Contact Infos')
                ->schema([
                    Repeater::make('contact_infos')
                        ->relationship()
                        ->schema([
                            Select::make('type')
                                ->options([
                                    'phone' => 'Phone',
                                    'email' => 'Email',
                                    'address' => 'Address',
                                    'hours' => 'Hours',
                                ])->required(),
                            TextInput::make('value')->required(),
                            Grid::make(3)->schema([
                                TextInput::make('label_en')->label('Label (EN)'),
                                TextInput::make('label_zh')->label('Label (ZH)'),
                                TextInput::make('label_ms')->label('Label (MS)'),
                            ]),
                            Grid::make(3)->schema([
                                TextInput::make('note_en')->label('Note (EN)'),
                                TextInput::make('note_zh')->label('Note (ZH)'),
                                TextInput::make('note_ms')->label('Note (MS)'),
                            ]),
                        ])->columns(2)->collapsible(),
                ])->collapsible(),

            Section::make('Contact Maps')
                ->schema([
                    Repeater::make('contact_maps')
                        ->relationship()
                        ->schema([
                            Textarea::make('map_iframe_url')->label('Map Iframe URL')->required(),
                        ])->collapsible(),
                ])->collapsible(),

            Section::make('Contact FAQs')
                ->schema([
                    Repeater::make('contact_faqs')
                        ->relationship()
                        ->schema([
                            Grid::make(3)->schema([
                                TextInput::make('question_en')->label('Question (EN)'),
                                TextInput::make('question_zh')->label('Question (ZH)'),
                                TextInput::make('question_ms')->label('Question (MS)'),
                            ]),
                            Grid::make(3)->schema([
                                Textarea::make('answer_en')->label('Answer (EN)'),
                                Textarea::make('answer_zh')->label('Answer (ZH)'),
                                Textarea::make('answer_ms')->label('Answer (MS)'),
                            ]),
                        ])->columns(1)->collapsible(),
                ])->collapsible(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('contact_title_en')->label('Title (EN)')->searchable(),
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
            'index' => Pages\ListContactCms::route('/'),
            'create' => Pages\CreateContactCms::route('/create'),
            'edit' => Pages\EditContactCms::route('/{record}/edit'),
        ];
    }

}
