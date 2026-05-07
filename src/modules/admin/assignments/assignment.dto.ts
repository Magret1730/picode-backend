import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  levelId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  instructions!: string;

  @IsOptional()
  requirements?: unknown;

  @IsOptional()
  @IsString()
  starterCode?: string;

  @IsOptional()
  testConfig?: unknown;

  @IsInt()
  @Min(1)
  orderIndex!: number;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  requirements?: unknown;

  @IsOptional()
  @IsString()
  starterCode?: string;

  @IsOptional()
  testConfig?: unknown;

  @IsOptional()
  @IsInt()
  @Min(1)
  orderIndex?: number;
}

