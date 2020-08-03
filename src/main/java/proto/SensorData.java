// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: Pose.proto

package proto;

public final class SensorData {
  private SensorData() {}
  public static void registerAllExtensions(
      com.google.protobuf.ExtensionRegistryLite registry) {
  }

  public static void registerAllExtensions(
      com.google.protobuf.ExtensionRegistry registry) {
    registerAllExtensions(
        (com.google.protobuf.ExtensionRegistryLite) registry);
  }
  public interface PoseOrBuilder extends
      // @@protoc_insertion_point(interface_extends:formats.Pose)
      com.google.protobuf.MessageOrBuilder {

    /**
     * <code>double gps_timestamp = 1;</code>
     */
    double getGpsTimestamp();

    /**
     * <code>double lat = 2;</code>
     */
    double getLat();

    /**
     * <code>double lng = 3;</code>
     */
    double getLng();

    /**
     * <code>double alt = 4;</code>
     */
    double getAlt();

    /**
     * <code>float roll_deg = 5;</code>
     */
    float getRollDeg();

    /**
     * <code>float pitch_deg = 6;</code>
     */
    float getPitchDeg();

    /**
     * <code>float yaw_deg = 7;</code>
     */
    float getYawDeg();
  }
  /**
   * Protobuf type {@code formats.Pose}
   */
  public  static final class Pose extends
      com.google.protobuf.GeneratedMessageV3 implements
      // @@protoc_insertion_point(message_implements:formats.Pose)
      PoseOrBuilder {
    // Use Pose.newBuilder() to construct.
    private Pose(com.google.protobuf.GeneratedMessageV3.Builder<?> builder) {
      super(builder);
    }
    private Pose() {
      gpsTimestamp_ = 0D;
      lat_ = 0D;
      lng_ = 0D;
      alt_ = 0D;
      rollDeg_ = 0F;
      pitchDeg_ = 0F;
      yawDeg_ = 0F;
    }

    @java.lang.Override
    public final com.google.protobuf.UnknownFieldSet
    getUnknownFields() {
      return com.google.protobuf.UnknownFieldSet.getDefaultInstance();
    }
    private Pose(
        com.google.protobuf.CodedInputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws com.google.protobuf.InvalidProtocolBufferException {
      this();
      int mutable_bitField0_ = 0;
      try {
        boolean done = false;
        while (!done) {
          int tag = input.readTag();
          switch (tag) {
            case 0:
              done = true;
              break;
            default: {
              if (!input.skipField(tag)) {
                done = true;
              }
              break;
            }
            case 9: {

              gpsTimestamp_ = input.readDouble();
              break;
            }
            case 17: {

              lat_ = input.readDouble();
              break;
            }
            case 25: {

              lng_ = input.readDouble();
              break;
            }
            case 33: {

              alt_ = input.readDouble();
              break;
            }
            case 45: {

              rollDeg_ = input.readFloat();
              break;
            }
            case 53: {

              pitchDeg_ = input.readFloat();
              break;
            }
            case 61: {

              yawDeg_ = input.readFloat();
              break;
            }
          }
        }
      } catch (com.google.protobuf.InvalidProtocolBufferException e) {
        throw e.setUnfinishedMessage(this);
      } catch (java.io.IOException e) {
        throw new com.google.protobuf.InvalidProtocolBufferException(
            e).setUnfinishedMessage(this);
      } finally {
        makeExtensionsImmutable();
      }
    }
    public static final com.google.protobuf.Descriptors.Descriptor
        getDescriptor() {
      return proto.SensorData.internal_static_formats_Pose_descriptor;
    }

    protected com.google.protobuf.GeneratedMessageV3.FieldAccessorTable
        internalGetFieldAccessorTable() {
      return proto.SensorData.internal_static_formats_Pose_fieldAccessorTable
          .ensureFieldAccessorsInitialized(
              proto.SensorData.Pose.class, proto.SensorData.Pose.Builder.class);
    }

    public static final int GPS_TIMESTAMP_FIELD_NUMBER = 1;
    private double gpsTimestamp_;
    /**
     * <code>double gps_timestamp = 1;</code>
     */
    public double getGpsTimestamp() {
      return gpsTimestamp_;
    }

    public static final int LAT_FIELD_NUMBER = 2;
    private double lat_;
    /**
     * <code>double lat = 2;</code>
     */
    public double getLat() {
      return lat_;
    }

    public static final int LNG_FIELD_NUMBER = 3;
    private double lng_;
    /**
     * <code>double lng = 3;</code>
     */
    public double getLng() {
      return lng_;
    }

    public static final int ALT_FIELD_NUMBER = 4;
    private double alt_;
    /**
     * <code>double alt = 4;</code>
     */
    public double getAlt() {
      return alt_;
    }

    public static final int ROLL_DEG_FIELD_NUMBER = 5;
    private float rollDeg_;
    /**
     * <code>float roll_deg = 5;</code>
     */
    public float getRollDeg() {
      return rollDeg_;
    }

    public static final int PITCH_DEG_FIELD_NUMBER = 6;
    private float pitchDeg_;
    /**
     * <code>float pitch_deg = 6;</code>
     */
    public float getPitchDeg() {
      return pitchDeg_;
    }

    public static final int YAW_DEG_FIELD_NUMBER = 7;
    private float yawDeg_;
    /**
     * <code>float yaw_deg = 7;</code>
     */
    public float getYawDeg() {
      return yawDeg_;
    }

    private byte memoizedIsInitialized = -1;
    public final boolean isInitialized() {
      byte isInitialized = memoizedIsInitialized;
      if (isInitialized == 1) return true;
      if (isInitialized == 0) return false;

      memoizedIsInitialized = 1;
      return true;
    }

    public void writeTo(com.google.protobuf.CodedOutputStream output)
                        throws java.io.IOException {
      if (gpsTimestamp_ != 0D) {
        output.writeDouble(1, gpsTimestamp_);
      }
      if (lat_ != 0D) {
        output.writeDouble(2, lat_);
      }
      if (lng_ != 0D) {
        output.writeDouble(3, lng_);
      }
      if (alt_ != 0D) {
        output.writeDouble(4, alt_);
      }
      if (rollDeg_ != 0F) {
        output.writeFloat(5, rollDeg_);
      }
      if (pitchDeg_ != 0F) {
        output.writeFloat(6, pitchDeg_);
      }
      if (yawDeg_ != 0F) {
        output.writeFloat(7, yawDeg_);
      }
    }

    public int getSerializedSize() {
      int size = memoizedSize;
      if (size != -1) return size;

      size = 0;
      if (gpsTimestamp_ != 0D) {
        size += com.google.protobuf.CodedOutputStream
          .computeDoubleSize(1, gpsTimestamp_);
      }
      if (lat_ != 0D) {
        size += com.google.protobuf.CodedOutputStream
          .computeDoubleSize(2, lat_);
      }
      if (lng_ != 0D) {
        size += com.google.protobuf.CodedOutputStream
          .computeDoubleSize(3, lng_);
      }
      if (alt_ != 0D) {
        size += com.google.protobuf.CodedOutputStream
          .computeDoubleSize(4, alt_);
      }
      if (rollDeg_ != 0F) {
        size += com.google.protobuf.CodedOutputStream
          .computeFloatSize(5, rollDeg_);
      }
      if (pitchDeg_ != 0F) {
        size += com.google.protobuf.CodedOutputStream
          .computeFloatSize(6, pitchDeg_);
      }
      if (yawDeg_ != 0F) {
        size += com.google.protobuf.CodedOutputStream
          .computeFloatSize(7, yawDeg_);
      }
      memoizedSize = size;
      return size;
    }

    private static final long serialVersionUID = 0L;
    @java.lang.Override
    public boolean equals(final java.lang.Object obj) {
      if (obj == this) {
       return true;
      }
      if (!(obj instanceof proto.SensorData.Pose)) {
        return super.equals(obj);
      }
      proto.SensorData.Pose other = (proto.SensorData.Pose) obj;

      boolean result = true;
      result = result && (
          java.lang.Double.doubleToLongBits(getGpsTimestamp())
          == java.lang.Double.doubleToLongBits(
              other.getGpsTimestamp()));
      result = result && (
          java.lang.Double.doubleToLongBits(getLat())
          == java.lang.Double.doubleToLongBits(
              other.getLat()));
      result = result && (
          java.lang.Double.doubleToLongBits(getLng())
          == java.lang.Double.doubleToLongBits(
              other.getLng()));
      result = result && (
          java.lang.Double.doubleToLongBits(getAlt())
          == java.lang.Double.doubleToLongBits(
              other.getAlt()));
      result = result && (
          java.lang.Float.floatToIntBits(getRollDeg())
          == java.lang.Float.floatToIntBits(
              other.getRollDeg()));
      result = result && (
          java.lang.Float.floatToIntBits(getPitchDeg())
          == java.lang.Float.floatToIntBits(
              other.getPitchDeg()));
      result = result && (
          java.lang.Float.floatToIntBits(getYawDeg())
          == java.lang.Float.floatToIntBits(
              other.getYawDeg()));
      return result;
    }

    @java.lang.Override
    public int hashCode() {
      if (memoizedHashCode != 0) {
        return memoizedHashCode;
      }
      int hash = 41;
      hash = (19 * hash) + getDescriptor().hashCode();
      hash = (37 * hash) + GPS_TIMESTAMP_FIELD_NUMBER;
      hash = (53 * hash) + com.google.protobuf.Internal.hashLong(
          java.lang.Double.doubleToLongBits(getGpsTimestamp()));
      hash = (37 * hash) + LAT_FIELD_NUMBER;
      hash = (53 * hash) + com.google.protobuf.Internal.hashLong(
          java.lang.Double.doubleToLongBits(getLat()));
      hash = (37 * hash) + LNG_FIELD_NUMBER;
      hash = (53 * hash) + com.google.protobuf.Internal.hashLong(
          java.lang.Double.doubleToLongBits(getLng()));
      hash = (37 * hash) + ALT_FIELD_NUMBER;
      hash = (53 * hash) + com.google.protobuf.Internal.hashLong(
          java.lang.Double.doubleToLongBits(getAlt()));
      hash = (37 * hash) + ROLL_DEG_FIELD_NUMBER;
      hash = (53 * hash) + java.lang.Float.floatToIntBits(
          getRollDeg());
      hash = (37 * hash) + PITCH_DEG_FIELD_NUMBER;
      hash = (53 * hash) + java.lang.Float.floatToIntBits(
          getPitchDeg());
      hash = (37 * hash) + YAW_DEG_FIELD_NUMBER;
      hash = (53 * hash) + java.lang.Float.floatToIntBits(
          getYawDeg());
      hash = (29 * hash) + unknownFields.hashCode();
      memoizedHashCode = hash;
      return hash;
    }

    public static proto.SensorData.Pose parseFrom(
        com.google.protobuf.ByteString data)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data);
    }
    public static proto.SensorData.Pose parseFrom(
        com.google.protobuf.ByteString data,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data, extensionRegistry);
    }
    public static proto.SensorData.Pose parseFrom(byte[] data)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data);
    }
    public static proto.SensorData.Pose parseFrom(
        byte[] data,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws com.google.protobuf.InvalidProtocolBufferException {
      return PARSER.parseFrom(data, extensionRegistry);
    }
    public static proto.SensorData.Pose parseFrom(java.io.InputStream input)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input);
    }
    public static proto.SensorData.Pose parseFrom(
        java.io.InputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input, extensionRegistry);
    }
    public static proto.SensorData.Pose parseDelimitedFrom(java.io.InputStream input)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseDelimitedWithIOException(PARSER, input);
    }
    public static proto.SensorData.Pose parseDelimitedFrom(
        java.io.InputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseDelimitedWithIOException(PARSER, input, extensionRegistry);
    }
    public static proto.SensorData.Pose parseFrom(
        com.google.protobuf.CodedInputStream input)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input);
    }
    public static proto.SensorData.Pose parseFrom(
        com.google.protobuf.CodedInputStream input,
        com.google.protobuf.ExtensionRegistryLite extensionRegistry)
        throws java.io.IOException {
      return com.google.protobuf.GeneratedMessageV3
          .parseWithIOException(PARSER, input, extensionRegistry);
    }

    public Builder newBuilderForType() { return newBuilder(); }
    public static Builder newBuilder() {
      return DEFAULT_INSTANCE.toBuilder();
    }
    public static Builder newBuilder(proto.SensorData.Pose prototype) {
      return DEFAULT_INSTANCE.toBuilder().mergeFrom(prototype);
    }
    public Builder toBuilder() {
      return this == DEFAULT_INSTANCE
          ? new Builder() : new Builder().mergeFrom(this);
    }

    @java.lang.Override
    protected Builder newBuilderForType(
        com.google.protobuf.GeneratedMessageV3.BuilderParent parent) {
      Builder builder = new Builder(parent);
      return builder;
    }
    /**
     * Protobuf type {@code formats.Pose}
     */
    public static final class Builder extends
        com.google.protobuf.GeneratedMessageV3.Builder<Builder> implements
        // @@protoc_insertion_point(builder_implements:formats.Pose)
        proto.SensorData.PoseOrBuilder {
      public static final com.google.protobuf.Descriptors.Descriptor
          getDescriptor() {
        return proto.SensorData.internal_static_formats_Pose_descriptor;
      }

      protected com.google.protobuf.GeneratedMessageV3.FieldAccessorTable
          internalGetFieldAccessorTable() {
        return proto.SensorData.internal_static_formats_Pose_fieldAccessorTable
            .ensureFieldAccessorsInitialized(
                proto.SensorData.Pose.class, proto.SensorData.Pose.Builder.class);
      }

      // Construct using proto.SensorData.Pose.newBuilder()
      private Builder() {
        maybeForceBuilderInitialization();
      }

      private Builder(
          com.google.protobuf.GeneratedMessageV3.BuilderParent parent) {
        super(parent);
        maybeForceBuilderInitialization();
      }
      private void maybeForceBuilderInitialization() {
        if (com.google.protobuf.GeneratedMessageV3
                .alwaysUseFieldBuilders) {
        }
      }
      public Builder clear() {
        super.clear();
        gpsTimestamp_ = 0D;

        lat_ = 0D;

        lng_ = 0D;

        alt_ = 0D;

        rollDeg_ = 0F;

        pitchDeg_ = 0F;

        yawDeg_ = 0F;

        return this;
      }

      public com.google.protobuf.Descriptors.Descriptor
          getDescriptorForType() {
        return proto.SensorData.internal_static_formats_Pose_descriptor;
      }

      public proto.SensorData.Pose getDefaultInstanceForType() {
        return proto.SensorData.Pose.getDefaultInstance();
      }

      public proto.SensorData.Pose build() {
        proto.SensorData.Pose result = buildPartial();
        if (!result.isInitialized()) {
          throw newUninitializedMessageException(result);
        }
        return result;
      }

      public proto.SensorData.Pose buildPartial() {
        proto.SensorData.Pose result = new proto.SensorData.Pose(this);
        result.gpsTimestamp_ = gpsTimestamp_;
        result.lat_ = lat_;
        result.lng_ = lng_;
        result.alt_ = alt_;
        result.rollDeg_ = rollDeg_;
        result.pitchDeg_ = pitchDeg_;
        result.yawDeg_ = yawDeg_;
        onBuilt();
        return result;
      }

      public Builder clone() {
        return (Builder) super.clone();
      }
      public Builder setField(
          com.google.protobuf.Descriptors.FieldDescriptor field,
          Object value) {
        return (Builder) super.setField(field, value);
      }
      public Builder clearField(
          com.google.protobuf.Descriptors.FieldDescriptor field) {
        return (Builder) super.clearField(field);
      }
      public Builder clearOneof(
          com.google.protobuf.Descriptors.OneofDescriptor oneof) {
        return (Builder) super.clearOneof(oneof);
      }
      public Builder setRepeatedField(
          com.google.protobuf.Descriptors.FieldDescriptor field,
          int index, Object value) {
        return (Builder) super.setRepeatedField(field, index, value);
      }
      public Builder addRepeatedField(
          com.google.protobuf.Descriptors.FieldDescriptor field,
          Object value) {
        return (Builder) super.addRepeatedField(field, value);
      }
      public Builder mergeFrom(com.google.protobuf.Message other) {
        if (other instanceof proto.SensorData.Pose) {
          return mergeFrom((proto.SensorData.Pose)other);
        } else {
          super.mergeFrom(other);
          return this;
        }
      }

      public Builder mergeFrom(proto.SensorData.Pose other) {
        if (other == proto.SensorData.Pose.getDefaultInstance()) return this;
        if (other.getGpsTimestamp() != 0D) {
          setGpsTimestamp(other.getGpsTimestamp());
        }
        if (other.getLat() != 0D) {
          setLat(other.getLat());
        }
        if (other.getLng() != 0D) {
          setLng(other.getLng());
        }
        if (other.getAlt() != 0D) {
          setAlt(other.getAlt());
        }
        if (other.getRollDeg() != 0F) {
          setRollDeg(other.getRollDeg());
        }
        if (other.getPitchDeg() != 0F) {
          setPitchDeg(other.getPitchDeg());
        }
        if (other.getYawDeg() != 0F) {
          setYawDeg(other.getYawDeg());
        }
        onChanged();
        return this;
      }

      public final boolean isInitialized() {
        return true;
      }

      public Builder mergeFrom(
          com.google.protobuf.CodedInputStream input,
          com.google.protobuf.ExtensionRegistryLite extensionRegistry)
          throws java.io.IOException {
        proto.SensorData.Pose parsedMessage = null;
        try {
          parsedMessage = PARSER.parsePartialFrom(input, extensionRegistry);
        } catch (com.google.protobuf.InvalidProtocolBufferException e) {
          parsedMessage = (proto.SensorData.Pose) e.getUnfinishedMessage();
          throw e.unwrapIOException();
        } finally {
          if (parsedMessage != null) {
            mergeFrom(parsedMessage);
          }
        }
        return this;
      }

      private double gpsTimestamp_ ;
      /**
       * <code>double gps_timestamp = 1;</code>
       */
      public double getGpsTimestamp() {
        return gpsTimestamp_;
      }
      /**
       * <code>double gps_timestamp = 1;</code>
       */
      public Builder setGpsTimestamp(double value) {
        
        gpsTimestamp_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>double gps_timestamp = 1;</code>
       */
      public Builder clearGpsTimestamp() {
        
        gpsTimestamp_ = 0D;
        onChanged();
        return this;
      }

      private double lat_ ;
      /**
       * <code>double lat = 2;</code>
       */
      public double getLat() {
        return lat_;
      }
      /**
       * <code>double lat = 2;</code>
       */
      public Builder setLat(double value) {
        
        lat_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>double lat = 2;</code>
       */
      public Builder clearLat() {
        
        lat_ = 0D;
        onChanged();
        return this;
      }

      private double lng_ ;
      /**
       * <code>double lng = 3;</code>
       */
      public double getLng() {
        return lng_;
      }
      /**
       * <code>double lng = 3;</code>
       */
      public Builder setLng(double value) {
        
        lng_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>double lng = 3;</code>
       */
      public Builder clearLng() {
        
        lng_ = 0D;
        onChanged();
        return this;
      }

      private double alt_ ;
      /**
       * <code>double alt = 4;</code>
       */
      public double getAlt() {
        return alt_;
      }
      /**
       * <code>double alt = 4;</code>
       */
      public Builder setAlt(double value) {
        
        alt_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>double alt = 4;</code>
       */
      public Builder clearAlt() {
        
        alt_ = 0D;
        onChanged();
        return this;
      }

      private float rollDeg_ ;
      /**
       * <code>float roll_deg = 5;</code>
       */
      public float getRollDeg() {
        return rollDeg_;
      }
      /**
       * <code>float roll_deg = 5;</code>
       */
      public Builder setRollDeg(float value) {
        
        rollDeg_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>float roll_deg = 5;</code>
       */
      public Builder clearRollDeg() {
        
        rollDeg_ = 0F;
        onChanged();
        return this;
      }

      private float pitchDeg_ ;
      /**
       * <code>float pitch_deg = 6;</code>
       */
      public float getPitchDeg() {
        return pitchDeg_;
      }
      /**
       * <code>float pitch_deg = 6;</code>
       */
      public Builder setPitchDeg(float value) {
        
        pitchDeg_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>float pitch_deg = 6;</code>
       */
      public Builder clearPitchDeg() {
        
        pitchDeg_ = 0F;
        onChanged();
        return this;
      }

      private float yawDeg_ ;
      /**
       * <code>float yaw_deg = 7;</code>
       */
      public float getYawDeg() {
        return yawDeg_;
      }
      /**
       * <code>float yaw_deg = 7;</code>
       */
      public Builder setYawDeg(float value) {
        
        yawDeg_ = value;
        onChanged();
        return this;
      }
      /**
       * <code>float yaw_deg = 7;</code>
       */
      public Builder clearYawDeg() {
        
        yawDeg_ = 0F;
        onChanged();
        return this;
      }
      public final Builder setUnknownFields(
          final com.google.protobuf.UnknownFieldSet unknownFields) {
        return this;
      }

      public final Builder mergeUnknownFields(
          final com.google.protobuf.UnknownFieldSet unknownFields) {
        return this;
      }


      // @@protoc_insertion_point(builder_scope:formats.Pose)
    }

    // @@protoc_insertion_point(class_scope:formats.Pose)
    private static final proto.SensorData.Pose DEFAULT_INSTANCE;
    static {
      DEFAULT_INSTANCE = new proto.SensorData.Pose();
    }

    public static proto.SensorData.Pose getDefaultInstance() {
      return DEFAULT_INSTANCE;
    }

    private static final com.google.protobuf.Parser<Pose>
        PARSER = new com.google.protobuf.AbstractParser<Pose>() {
      public Pose parsePartialFrom(
          com.google.protobuf.CodedInputStream input,
          com.google.protobuf.ExtensionRegistryLite extensionRegistry)
          throws com.google.protobuf.InvalidProtocolBufferException {
          return new Pose(input, extensionRegistry);
      }
    };

    public static com.google.protobuf.Parser<Pose> parser() {
      return PARSER;
    }

    @java.lang.Override
    public com.google.protobuf.Parser<Pose> getParserForType() {
      return PARSER;
    }

    public proto.SensorData.Pose getDefaultInstanceForType() {
      return DEFAULT_INSTANCE;
    }

  }

  private static final com.google.protobuf.Descriptors.Descriptor
    internal_static_formats_Pose_descriptor;
  private static final 
    com.google.protobuf.GeneratedMessageV3.FieldAccessorTable
      internal_static_formats_Pose_fieldAccessorTable;

  public static com.google.protobuf.Descriptors.FileDescriptor
      getDescriptor() {
    return descriptor;
  }
  private static  com.google.protobuf.Descriptors.FileDescriptor
      descriptor;
  static {
    java.lang.String[] descriptorData = {
      "\n\nPose.proto\022\007formats\"z\n\004Pose\022\025\n\rgps_tim" +
      "estamp\030\001 \001(\001\022\013\n\003lat\030\002 \001(\001\022\013\n\003lng\030\003 \001(\001\022\013" +
      "\n\003alt\030\004 \001(\001\022\020\n\010roll_deg\030\005 \001(\002\022\021\n\tpitch_d" +
      "eg\030\006 \001(\002\022\017\n\007yaw_deg\030\007 \001(\002B\023\n\005protoB\nSens" +
      "orDatab\006proto3"
    };
    com.google.protobuf.Descriptors.FileDescriptor.InternalDescriptorAssigner assigner =
        new com.google.protobuf.Descriptors.FileDescriptor.    InternalDescriptorAssigner() {
          public com.google.protobuf.ExtensionRegistry assignDescriptors(
              com.google.protobuf.Descriptors.FileDescriptor root) {
            descriptor = root;
            return null;
          }
        };
    com.google.protobuf.Descriptors.FileDescriptor
      .internalBuildGeneratedFileFrom(descriptorData,
        new com.google.protobuf.Descriptors.FileDescriptor[] {
        }, assigner);
    internal_static_formats_Pose_descriptor =
      getDescriptor().getMessageTypes().get(0);
    internal_static_formats_Pose_fieldAccessorTable = new
      com.google.protobuf.GeneratedMessageV3.FieldAccessorTable(
        internal_static_formats_Pose_descriptor,
        new java.lang.String[] { "GpsTimestamp", "Lat", "Lng", "Alt", "RollDeg", "PitchDeg", "YawDeg", });
  }

  // @@protoc_insertion_point(outer_class_scope)
}
